<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;

use App\Models\Supplier;

class AhpController extends Controller
{
    public function triggerCalculation(Request $request)
    {
        $tenantId = $request->user()->tenant_id;

        try {
            // Bungkus ID Tenant menjadi format JSON universal
            $payload = json_encode([
                'tenant_id' => $tenantId,
                'timestamp' => now()->toIso8601String()
            ]);

            // Tembak LANGSUNG ke Redis menggunakan jalur 'microservice' (tanpa prefix)
            Redis::connection('microservice')->lpush('posky:ahp_tasks', $payload);

            return response()->json([
                'success' => true,
                'message' => 'Proses kalkulasi AHP sedang berjalan di latar belakang.'
            ], 202);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memicu proses AHP: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /ahp/recommendations
     * Mengambil daftar rekomendasi supplier berdasarkan ranking AHP terbaik
     */
    public function recommendations(Request $request)
    {
        $tenantId = $request->user()->tenant_id;

        try {
            // Mengambil data supplier, pastikan rank tidak null, dan urutkan dari rank 1
            $recommendedSuppliers = Supplier::where('tenant_id', $tenantId)
                ->whereNotNull('rank')
                ->orderBy('rank', 'asc')
                ->get();

            // Jika belum ada perhitungan, kembalikan array kosong dengan pesan yang sesuai
            if ($recommendedSuppliers->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Belum ada data rekomendasi. Silakan jalankan kalkulasi AHP terlebih dahulu.',
                    'data' => []
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Berhasil memuat rekomendasi supplier.',
                'data' => $recommendedSuppliers
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memuat rekomendasi: ' . $e->getMessage()
            ], 500);
        }
    }
}
