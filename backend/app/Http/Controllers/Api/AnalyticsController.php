<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Customer;

class AnalyticsController extends Controller
{
    /**
     * GET /analytics/rfm
     * Mengambil data analitik RFM pelanggan
     */
    public function rfm(Request $request)
    {
        $tenantId = $request->user()->tenant_id;

        try {
            // Ambil pelanggan yang sudah memiliki skor RFM, urutkan dari skor terbaik
            $rfmData = Customer::where('tenant_id', $tenantId)
                ->whereNotNull('rfm_segment')
                ->orderBy('r_score', 'desc')
                ->orderBy('f_score', 'desc')
                ->orderBy('m_score', 'desc')
                ->get([
                    'id',
                    'name',
                    'phone',
                    'last_transaction_at',
                    'total_transactions',
                    'total_spent',
                    'r_score',
                    'f_score',
                    'm_score',
                    'rfm_segment'
                ]);

            // Opsional: Buat ringkasan jumlah pelanggan per segmen untuk grafik (Pie Chart)
            $segmentSummary = $rfmData->groupBy('rfm_segment')->map->count();

            return response()->json([
                'success' => true,
                'message' => 'Berhasil memuat data analitik RFM.',
                'summary' => $segmentSummary,
                'data' => $rfmData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memuat analitik RFM: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /analytics/cohort
     * Menghasilkan matriks retensi pelanggan (Cohort Analysis)
     */
    public function cohort(Request $request)
    {
        $tenantId = $request->user()->tenant_id;

        try {
            // Menggunakan PostgreSQL CTE (Common Table Expressions) untuk efisiensi tinggi
            $query = "
                WITH CustomerCohorts AS (
                    -- Langkah 1: Cari bulan & tahun (YYYY-MM) saat pelanggan PERTAMA KALI bertransaksi
                    SELECT 
                        customer_id, 
                        TO_CHAR(MIN(created_at), 'YYYY-MM') AS cohort_month
                    FROM transactions
                    WHERE tenant_id = :tenant_id_1 AND status = 'completed' AND customer_id IS NOT NULL
                    GROUP BY customer_id
                ),
                ActiveMonths AS (
                    -- Langkah 2: Ambil semua bulan transaksi aktif untuk setiap pelanggan
                    SELECT 
                        customer_id,
                        TO_CHAR(created_at, 'YYYY-MM') AS transaction_month
                    FROM transactions
                    WHERE tenant_id = :tenant_id_2 AND status = 'completed' AND customer_id IS NOT NULL
                    GROUP BY customer_id, TO_CHAR(created_at, 'YYYY-MM')
                )
                -- Langkah 3: Gabungkan (JOIN) dan hitung jumlah pelanggan unik per irisan bulan
                SELECT 
                    c.cohort_month,
                    a.transaction_month,
                    COUNT(DISTINCT a.customer_id) as total_customers
                FROM CustomerCohorts c
                JOIN ActiveMonths a ON c.customer_id = a.customer_id
                GROUP BY c.cohort_month, a.transaction_month
                ORDER BY c.cohort_month ASC, a.transaction_month ASC;
            ";

            // Eksekusi raw query
            $results = DB::select($query, [
                'tenant_id_1' => $tenantId,
                'tenant_id_2' => $tenantId
            ]);

            // Langkah 4: Format data SQL mentah menjadi Matrix bersarang untuk Frontend
            $cohortMatrix = [];
            foreach ($results as $row) {
                $cohort = $row->cohort_month;
                $month = $row->transaction_month;
                $count = $row->total_customers;

                if (!isset($cohortMatrix[$cohort])) {
                    $cohortMatrix[$cohort] = [];
                }

                // Susun data: ["2026-05" => ["2026-05" => 10, "2026-06" => 4, "2026-07" => 2]]
                $cohortMatrix[$cohort][$month] = $count;
            }

            return response()->json([
                'success' => true,
                'message' => 'Berhasil memuat matriks Cohort Analysis.',
                'data' => $cohortMatrix
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memuat analitik Cohort: ' . $e->getMessage()
            ], 500);
        }
    }
}
