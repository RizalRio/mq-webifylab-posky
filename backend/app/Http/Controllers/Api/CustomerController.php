<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CustomerController extends Controller
{
    /**
     * GET /customers
     */
    public function index(Request $request)
    {
        $query = Customer::query();

        // Pencarian multi-kolom (Nama, Telepon, Email)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('phone', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%");
            });
        }

        // Filter berdasarkan segmen RFM (Contoh: Champions, Loyal, Recent Customers, At Risk, New)
        if ($request->filled('rfm_segment')) {
            $query->where('rfm_segment', $request->rfm_segment);
        }

        $sort = $request->input('sort', 'created_at');
        $order = $request->input('order', 'desc');

        if (in_array($sort, ['name', 'created_at'])) {
            $query->orderBy($sort, $order === 'asc' ? 'asc' : 'desc');
        }

        $customers = $query->paginate($request->input('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $customers->items(),
            'meta' => [
                'page' => $customers->currentPage(),
                'per_page' => $customers->perPage(),
                'total' => $customers->total()
            ]
        ]);
    }

    /**
     * POST /customers
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
        ]);

        $validated['id'] = (string) Str::uuid();

        $customer = Customer::create($validated);

        return response()->json([
            'success' => true,
            'data' => $customer
        ], 201);
    }

    /**
     * GET /customers/{id}
     */
    public function show($id)
    {
        $customer = Customer::findOrFail($id);

        // Nantinya kita bisa tambahkan load total_spent atau rekap transaksi di sini
        $customer->load('transactions');

        return response()->json(['success' => true, 'data' => $customer]);
    }

    /**
     * PUT /customers/{id}
     */
    public function update(Request $request, $id)
    {
        $customer = Customer::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
        ]);

        $customer->update($validated);
        return response()->json(['success' => true, 'data' => $customer]);
    }

    /**
     * DELETE /customers/{id}
     */
    public function destroy($id)
    {
        $customer = Customer::findOrFail($id);

        if ($customer->transactions()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Customer memiliki riwayat transaksi, tidak dapat dihapus'
            ], 409);
        }

        $customer->delete();
        return response()->json(['success' => true, 'message' => 'Customer berhasil dihapus']);
    }
}
