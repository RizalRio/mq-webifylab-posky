<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\Customer;
use Carbon\Carbon;

class CalculateRFM extends Command
{
    // Nama perintah yang akan diketik di terminal
    protected $signature = 'analytics:calculate-rfm';

    // Deskripsi perintah
    protected $description = 'Menghitung nilai Recency, Frequency, Monetary dan Segmentasi Pelanggan';

    public function handle()
    {
        $this->info("Memulai proses kalkulasi RFM...");

        // 1. Ekstraksi Data Mentah
        // Mengambil tanggal terakhir beli, jumlah struk, dan total belanja untuk setiap pelanggan
        $rfmData = DB::table('transactions')
            ->whereNotNull('customer_id')
            ->where('status', 'completed')
            ->select(
                'customer_id',
                DB::raw('MAX(created_at) as last_transaction_at'),
                DB::raw('COUNT(id) as total_transactions'),
                DB::raw('SUM(total_amount) as total_spent')
            )
            ->groupBy('customer_id')
            ->get();

        if ($rfmData->isEmpty()) {
            $this->warn("Tidak ada data transaksi pelanggan yang ditemukan.");
            return;
        }

        $today = Carbon::now();

        // Membuat progress bar di terminal agar terlihat keren saat diproses
        $bar = $this->output->createProgressBar(count($rfmData));
        $bar->start();

        foreach ($rfmData as $data) {
            // Hitung jarak hari dari transaksi terakhir ke hari ini
            $lastTxDate = Carbon::parse($data->last_transaction_at);
            $recencyDays = $lastTxDate->diffInDays($today);

            // 2. Berikan Skor RFM (Skala 1-5)
            $rScore = $this->calculateRScore($recencyDays);
            $fScore = $this->calculateFScore($data->total_transactions);
            $mScore = $this->calculateMScore($data->total_spent);

            // 3. Tentukan Label Segmentasi
            $segment = $this->determineSegment($rScore, $fScore);

            // 4. Simpan ke Database
            // withoutGlobalScopes() wajib dipakai agar command ini tidak terblokir oleh TenantScope
            Customer::withoutGlobalScopes()
                ->where('id', $data->customer_id)
                ->update([
                    'last_transaction_at' => $data->last_transaction_at,
                    'total_transactions' => $data->total_transactions,
                    'total_spent' => $data->total_spent,
                    'r_score' => $rScore,
                    'f_score' => $fScore,
                    'm_score' => $mScore,
                    'rfm_segment' => $segment
                ]);

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("✅ Kalkulasi RFM selesai diperbarui!");
    }

    // --- Helper Scoring ---

    // Makin kecil hari (makin baru belanjanya), skor R makin tinggi
    private function calculateRScore($days)
    {
        if ($days <= 30) return 5;
        if ($days <= 60) return 4;
        if ($days <= 90) return 3;
        if ($days <= 180) return 2;
        return 1;
    }

    // Makin sering beli, skor F makin tinggi
    private function calculateFScore($freq)
    {
        if ($freq >= 20) return 5;
        if ($freq >= 10) return 4;
        if ($freq >= 5) return 3;
        if ($freq >= 2) return 2;
        return 1;
    }

    // Makin besar nilai belanja, skor M makin tinggi
    private function calculateMScore($spent)
    {
        if ($spent >= 5000000) return 5;
        if ($spent >= 2000000) return 4;
        if ($spent >= 1000000) return 3;
        if ($spent >= 500000) return 2;
        return 1;
    }

    // Penentuan Segmentasi (Berdasarkan matriks standar marketing industri)
    private function determineSegment($r, $f)
    {
        // Menggabungkan skor R dan F (misal R=5, F=4 menjadi int 54)
        $score = (int) ($r . $f);

        if (in_array($score, [55, 54, 45, 44])) return 'Champions';
        if (in_array($score, [53, 43, 35, 34, 33])) return 'Loyal Customers';
        if (in_array($score, [52, 51, 42, 41])) return 'Recent Customers';
        if (in_array($score, [32, 31, 23, 22])) return 'Needs Attention';
        if (in_array($score, [25, 24, 15, 14])) return 'At Risk';
        if (in_array($score, [13, 12, 11])) return 'Lost';

        return 'Promising'; // Default
    }
}
