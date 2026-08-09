<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    /**
     * GET /products
     * Menampilkan daftar produk dengan filter dan paginasi
     */
    public function index(Request $request)
    {
        $query = Product::query();

        // 1. Filter Pencarian (Nama atau SKU)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('sku', 'ilike', "%{$search}%");
            });
        }

        // 2. Filter Kategori
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        // 3. Filter Low Stock (Stok di bawah threshold)
        if ($request->boolean('low_stock')) {
            $query->whereColumn('stock', '<', 'min_stock_threshold');
        }

        // 4. Sorting (Pengurutan)
        $sort = $request->input('sort', 'created_at');
        $order = $request->input('order', 'desc');

        $allowedSorts = ['name', 'stock', 'cost_price', 'sell_price', 'created_at'];
        if (in_array($sort, $allowedSorts)) {
            $query->orderBy($sort, $order === 'asc' ? 'asc' : 'desc');
        }

        // 5. Eksekusi dengan Paginasi
        $perPage = $request->input('per_page', 20);
        $products = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $products->items(),
            'meta' => [
                'page' => $products->currentPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'last_page' => $products->lastPage()
            ]
        ]);
    }

    /**
     * POST /products
     * Menambah produk baru
     */
    public function store(Request $request)
    {
        $tenantId = $request->user()->tenant_id;

        $validated = $request->validate([
            // Validasi SKU agar unik HANYA di dalam tenant yang sama
            'sku' => [
                'required',
                'string',
                Rule::unique('products')->where(function ($query) use ($tenantId) {
                    return $query->where('tenant_id', $tenantId);
                })
            ],
            'name' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'stock' => 'required|integer|min:0',
            'min_stock_threshold' => 'required|integer|min:0',
            'cost_price' => 'required|numeric|min:0',
            'sell_price' => 'required|numeric|min:0|gt:cost_price',
        ]);

        // id dan tenant_id akan di-generate otomatis oleh Trait BelongsToTenant yang sudah kita buat
        $validated['id'] = (string) Str::uuid();

        $product = Product::create($validated);

        return response()->json([
            'success' => true,
            'data' => $product
        ], 201);
    }

    /**
     * GET /products/{id}
     * Menampilkan detail produk
     */
    public function show($id)
    {
        // TenantScope secara otomatis mencegah kasir melihat produk tenant lain
        $product = Product::findOrFail($id);

        // TODO: Saat modul AI dan Transaksi sudah lengkap, kita akan me-load relasi:
        // $product->load(['supplier', 'recent_transactions', 'forecast']);

        return response()->json([
            'success' => true,
            'data' => $product
        ]);
    }

    /**
     * PUT /products/{id}
     * Memperbarui informasi produk
     */
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $tenantId = $request->user()->tenant_id;

        // Menggunakan 'sometimes' agar request bisa bersifat partial update
        $validated = $request->validate([
            'sku' => [
                'sometimes',
                'required',
                'string',
                Rule::unique('products')->where(function ($query) use ($tenantId) {
                    return $query->where('tenant_id', $tenantId);
                })->ignore($product->id) // Abaikan validasi unik untuk ID produk ini sendiri
            ],
            'name' => 'sometimes|required|string|max:255',
            'category' => 'nullable|string|max:100',
            'stock' => 'sometimes|required|integer|min:0',
            'min_stock_threshold' => 'sometimes|required|integer|min:0',
            'cost_price' => 'sometimes|required|numeric|min:0',
            'sell_price' => 'sometimes|required|numeric|min:0|gt:cost_price',
        ]);

        $product->update($validated);

        return response()->json([
            'success' => true,
            'data' => $product
        ]);
    }

    /**
     * DELETE /products/{id}
     * Menghapus produk (Soft Delete)
     */
    public function destroy($id)
    {
        $product = Product::findOrFail($id);

        // Proteksi: Tidak bisa dihapus jika produk sudah pernah terjual/masuk transaksi
        if ($product->transactionItems()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Product has transactions, cannot delete'
            ], 409);
        }

        // Akan melakukan Soft Delete karena kita menggunakan $table->softDeletes() pada migrasi[cite: 1, 4]
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully'
        ]);
    }
}
