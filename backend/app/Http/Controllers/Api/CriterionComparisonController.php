<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CriterionComparison;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class CriterionComparisonController extends Controller
{
    // Mengambil seluruh data matriks perbandingan
    public function index(Request $request)
    {
        $comparisons = CriterionComparison::with(['criterion1', 'criterion2'])->get();

        return response()->json([
            'success' => true,
            'data' => $comparisons
        ]);
    }

    // Menyimpan atau memperbarui data matriks secara massal (Bulk)
    public function storeBulk(Request $request)
    {
        $validated = $request->validate([
            'comparisons' => 'required|array|min:1',
            'comparisons.*.criterion_id_1' => 'required|uuid|exists:criteria,id',
            'comparisons.*.criterion_id_2' => 'required|uuid|exists:criteria,id',
            'comparisons.*.value' => 'required|numeric|min:0.1|max:9',
        ]);

        $tenantId = $request->user()->tenant_id;

        try {
            DB::transaction(function () use ($validated, $tenantId) {
                foreach ($validated['comparisons'] as $item) {
                    // Gunakan updateOrCreate agar data tidak duplikat
                    CriterionComparison::updateOrCreate(
                        [
                            'tenant_id' => $tenantId,
                            'criterion_id_1' => $item['criterion_id_1'],
                            'criterion_id_2' => $item['criterion_id_2'],
                        ],
                        [
                            'id' => (string) Str::uuid(),
                            'value' => $item['value']
                        ]
                    );
                }
            });

            return response()->json([
                'success' => true,
                'message' => 'Matriks perbandingan kriteria berhasil disimpan.'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan matriks: ' . $e->getMessage()
            ], 422);
        }
    }
}
