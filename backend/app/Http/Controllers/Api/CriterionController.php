<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Criterion;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CriterionController extends Controller
{
    public function index(Request $request)
    {
        $criteria = Criterion::orderBy('code', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $criteria
        ]);
    }

    public function store(Request $request)
    {
        $tenantId = $request->user()->tenant_id;

        $validated = $request->validate([
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('criteria')->where(function ($query) use ($tenantId) {
                    return $query->where('tenant_id', $tenantId);
                })
            ],
            'name' => 'required|string|max:255',
            'type' => 'required|in:benefit,cost',
        ]);

        $validated['id'] = (string) Str::uuid();

        $criterion = Criterion::create($validated);

        return response()->json(['success' => true, 'data' => $criterion], 201);
    }

    public function show($id)
    {
        $criterion = Criterion::findOrFail($id);
        return response()->json(['success' => true, 'data' => $criterion]);
    }

    public function update(Request $request, $id)
    {
        $criterion = Criterion::findOrFail($id);
        $tenantId = $request->user()->tenant_id;

        $validated = $request->validate([
            'code' => [
                'sometimes',
                'required',
                'string',
                'max:50',
                Rule::unique('criteria')->where(function ($query) use ($tenantId) {
                    return $query->where('tenant_id', $tenantId);
                })->ignore($criterion->id)
            ],
            'name' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|in:benefit,cost',
        ]);

        $criterion->update($validated);
        return response()->json(['success' => true, 'data' => $criterion]);
    }

    public function destroy($id)
    {
        $criterion = Criterion::findOrFail($id);
        $criterion->delete();
        return response()->json(['success' => true, 'message' => 'Kriteria berhasil dihapus']);
    }
}
