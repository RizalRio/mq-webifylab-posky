<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SupplierEvaluation;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class SupplierEvaluationController extends Controller
{
    // Mengambil seluruh data penilaian
    public function index(Request $request)
    {
        $evaluations = SupplierEvaluation::with(['supplier', 'criterion'])->get();

        return response()->json([
            'success' => true,
            'data' => $evaluations
        ]);
    }

    // Menyimpan atau memperbarui data penilaian supplier secara massal (Bulk)
    public function storeBulk(Request $request)
    {
        $validated = $request->validate([
            'evaluations' => 'required|array|min:1',
            'evaluations.*.supplier_id' => 'required|uuid|exists:suppliers,id',
            'evaluations.*.criterion_id' => 'required|uuid|exists:criteria,id',
            'evaluations.*.raw_value' => 'required|numeric',
        ]);

        $tenantId = $request->user()->tenant_id;

        try {
            DB::transaction(function () use ($validated, $tenantId) {
                foreach ($validated['evaluations'] as $item) {
                    SupplierEvaluation::updateOrCreate(
                        [
                            'tenant_id' => $tenantId,
                            'supplier_id' => $item['supplier_id'],
                            'criterion_id' => $item['criterion_id'],
                        ],
                        [
                            'id' => (string) Str::uuid(),
                            'raw_value' => $item['raw_value']
                        ]
                    );
                }
            });

            return response()->json([
                'success' => true,
                'message' => 'Nilai evaluasi supplier berhasil disimpan.'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan evaluasi: ' . $e->getMessage()
            ], 422);
        }
    }
}
