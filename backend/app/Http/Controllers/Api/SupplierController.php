<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $query = Supplier::query();

        if ($request->filled('search')) {
            $query->where('name', 'ilike', "%{$request->search}%")
                ->orWhere('contact_person', 'ilike', "%{$request->search}%");
        }

        // Urutkan berdasarkan ranking AHP terbaik (jika sudah dihitung), lalu nama
        $query->orderBy('rank', 'asc')->orderBy('name', 'asc');

        $suppliers = $query->paginate($request->input('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $suppliers->items(),
            'meta' => [
                'page' => $suppliers->currentPage(),
                'per_page' => $suppliers->perPage(),
                'total' => $suppliers->total()
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
        ]);

        $validated['id'] = (string) Str::uuid();

        $supplier = Supplier::create($validated);

        return response()->json(['success' => true, 'data' => $supplier], 201);
    }

    public function show($id)
    {
        $supplier = Supplier::findOrFail($id);
        return response()->json(['success' => true, 'data' => $supplier]);
    }

    public function update(Request $request, $id)
    {
        $supplier = Supplier::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
        ]);

        $supplier->update($validated);
        return response()->json(['success' => true, 'data' => $supplier]);
    }

    public function destroy($id)
    {
        $supplier = Supplier::findOrFail($id);
        $supplier->delete();
        return response()->json(['success' => true, 'message' => 'Supplier berhasil dihapus']);
    }
}
