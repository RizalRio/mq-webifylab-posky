<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ServiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Service::query();

        if ($request->filled('search')) {
            $query->where('name', 'ilike', "%{$request->search}%")
                ->orWhere('description', 'ilike', "%{$request->search}%");
        }

        $sort = $request->input('sort', 'created_at');
        $order = $request->input('order', 'desc');

        if (in_array($sort, ['name', 'price', 'duration_minutes', 'created_at'])) {
            $query->orderBy($sort, $order === 'asc' ? 'asc' : 'desc');
        }

        $services = $query->paginate($request->input('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $services->items(),
            'meta' => [
                'page' => $services->currentPage(),
                'per_page' => $services->perPage(),
                'total' => $services->total()
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'duration_minutes' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
        ]);

        $validated['id'] = (string) Str::uuid();
        $service = Service::create($validated);

        return response()->json([
            'success' => true,
            'data' => $service
        ], 201);
    }

    public function show($id)
    {
        $service = Service::findOrFail($id);
        return response()->json(['success' => true, 'data' => $service]);
    }

    public function update(Request $request, $id)
    {
        $service = Service::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'duration_minutes' => 'sometimes|required|integer|min:1',
            'price' => 'sometimes|required|numeric|min:0',
        ]);

        $service->update($validated);
        return response()->json(['success' => true, 'data' => $service]);
    }

    public function destroy($id)
    {
        $service = Service::findOrFail($id);

        if ($service->transactionItems()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Service has transactions, cannot delete'
            ], 409);
        }

        $service->delete();
        return response()->json(['success' => true, 'message' => 'Service deleted successfully']);
    }
}
