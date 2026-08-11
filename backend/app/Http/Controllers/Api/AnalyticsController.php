<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Customer;
use App\Models\Transaction;
use App\Models\Product;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    /**
     * GET /analytics/dashboard
     * Endpoint utama untuk metrik dashboard
     */
    public function dashboard(Request $request)
    {
        $tenantId = $request->user()->tenant_id;

        try {
            // 1. Total Pendapatan & Jumlah Transaksi (Bulan Ini vs Bulan Lalu)
            $startOfThisMonth = Carbon::now()->startOfMonth();
            $startOfLastMonth = Carbon::now()->subMonth()->startOfMonth();
            $endOfLastMonth = Carbon::now()->subMonth()->endOfMonth();

            $thisMonthStats = Transaction::where('tenant_id', $tenantId)
                ->where('status', 'completed')
                ->where('created_at', '>=', $startOfThisMonth)
                ->selectRaw('COALESCE(SUM(total_amount), 0) as revenue, COUNT(*) as count')
                ->first();

            $lastMonthStats = Transaction::where('tenant_id', $tenantId)
                ->where('status', 'completed')
                ->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])
                ->selectRaw('COALESCE(SUM(total_amount), 0) as revenue, COUNT(*) as count')
                ->first();

            // Hitung persentase kenaikan/penurunan pendapatan
            $revenueGrowth = 0;
            if ($lastMonthStats->revenue > 0) {
                $revenueGrowth = (($thisMonthStats->revenue - $lastMonthStats->revenue) / $lastMonthStats->revenue) * 100;
            }

            // Hitung persentase kenaikan/penurunan transaksi
            $transactionGrowth = 0;
            if ($lastMonthStats->count > 0) {
                $transactionGrowth = (($thisMonthStats->count - $lastMonthStats->count) / $lastMonthStats->count) * 100;
            }

            // 2. Pelanggan Aktif
            $activeCustomersCount = Customer::where('tenant_id', $tenantId)->count();

            // 3. Peringatan Stok Rendah
            $lowStockCount = Product::where('tenant_id', $tenantId)
                ->whereColumn('stock', '<=', 'min_stock_threshold')
                ->count();

            // 4. Grafik Penjualan 30 Hari Terakhir
            $thirtyDaysAgo = Carbon::now()->subDays(29)->startOfDay();
            $salesTrendRaw = Transaction::where('tenant_id', $tenantId)
                ->where('status', 'completed')
                ->where('created_at', '>=', $thirtyDaysAgo)
                ->selectRaw('DATE(created_at) as date, SUM(total_amount) as total_sales')
                ->groupBy('date')
                ->orderBy('date', 'asc')
                ->get()
                ->pluck('total_sales', 'date')
                ->toArray();

            // Isi tanggal yang kosong dengan 0
            $salesTrend = [];
            for ($i = 29; $i >= 0; $i--) {
                $dateString = Carbon::now()->subDays($i)->format('Y-m-d');
                $salesTrend[] = [
                    'date' => $dateString,
                    'sales' => (float) ($salesTrendRaw[$dateString] ?? 0)
                ];
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'revenue' => [
                        'total' => (float) $thisMonthStats->revenue,
                        'growth' => round($revenueGrowth, 1)
                    ],
                    'transactions' => [
                        'total' => (int) $thisMonthStats->count,
                        'growth' => round($transactionGrowth, 1)
                    ],
                    'customers' => [
                        'total' => $activeCustomersCount,
                        'growth' => 0 // Bisa dihitung dari kohort, untuk simplifikasi kita set 0 dulu
                    ],
                    'inventory' => [
                        'low_stock_count' => $lowStockCount
                    ],
                    'sales_trend' => $salesTrend
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memuat metrik dashboard: ' . $e->getMessage()
            ], 500);
        }
    }

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
