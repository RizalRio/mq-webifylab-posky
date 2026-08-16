<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;
use App\Models\StockPrediction;

class ProphetController extends Controller
{
    /**
     * POST /prophet/predict
     * Memicu proses peramalan (forecasting) stok Prophet di latar belakang
     */
    public function triggerPrediction(Request $request)
    {
        $tenantId = $request->user()->tenant_id;

        try {
            // Format payload universal
            $payload = json_encode([
                'tenant_id' => $tenantId,
                'timestamp' => now()->toIso8601String()
            ]);

            // Mendorong pesan ke antrean Redis khusus Prophet
            Redis::connection('microservice')->lpush('posky:prophet_tasks', $payload);

            return response()->json([
                'success' => true,
                'message' => 'Proses ekstraksi data historis dan prediksi stok AI sedang berjalan di latar belakang.'
            ], 202);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memicu proses prediksi AI: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /prophet/predictions
     * Mengambil daftar prediksi stok habis, diurutkan dari yang paling mendesak
     */
    public function predictions(Request $request)
    {
        $tenantId = $request->user()->tenant_id;

        try {
            // Mengambil prediksi beserta detail produknya (nama dan sisa stok)
            // Diurutkan berdasarkan tanggal habis terdekat (ascending)
            $predictions = StockPrediction::with('product:id,name,stock')
                ->where('tenant_id', $tenantId)
                ->orderBy('estimated_stockout_date', 'asc')
                ->get();

            if ($predictions->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Belum ada data prediksi stok. AI sedang menganalisis atau data transaksi belum cukup.',
                    'data' => []
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Berhasil memuat prediksi pergerakan stok.',
                'data' => $predictions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memuat prediksi: ' . $e->getMessage()
            ], 500);
        }
    }
}
