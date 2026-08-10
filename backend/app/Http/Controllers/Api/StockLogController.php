<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StockLog;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class StockLogController extends Controller
{
    /**
     * GET /stock-logs
     * Riwayat mutasi stok (keluar, masuk, penyesuaian)
     */
    public function index(Request $request)
    {
        $query = StockLog::with(['product', 'user']);

        // Filter berdasarkan jenis mutasi (in, out, adjustment)
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Filter berdasarkan ID produk
        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        // Pencarian berdasarkan nama produk atau SKU
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('sku', 'ilike', "%{$search}%");
            });
        }

        $sort = $request->input('sort', 'created_at');
        $order = $request->input('order', 'desc');
        $query->orderBy($sort, $order === 'asc' ? 'asc' : 'desc');

        $logs = $query->paginate($request->input('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $logs->items(),
            'meta' => [
                'page' => $logs->currentPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
                'last_page' => $logs->lastPage(),
            ]
        ]);
    }

    /**
     * POST /stock-logs
     * Penyesuaian stok manual (Restock / Barang Rusak / Adjust)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|uuid|exists:products,id',
            'type' => 'required|in:in,out,adjustment',
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:255',
        ]);

        try {
            $log = DB::transaction(function () use ($validated, $request) {
                $product = Product::lockForUpdate()->findOrFail($validated['product_id']);

                $stockBefore = $product->stock;
                $qty = $validated['quantity'];

                if ($validated['type'] === 'in') {
                    $stockAfter = $stockBefore + $qty;
                } elseif ($validated['type'] === 'out') {
                    if ($stockBefore < $qty) {
                        throw new \Exception("Stok tidak mencukupi untuk pengurangan sebanyak {$qty}. Stok saat ini: {$stockBefore}");
                    }
                    $stockAfter = $stockBefore - $qty;
                } else {
                    // adjustment: kuantitas dianggap stok akhir yang baru
                    $stockAfter = $qty;
                    $qty = abs($stockAfter - $stockBefore);
                }

                // Update stok produk
                $product->stock = $stockAfter;
                $product->save();

                // Buat entri log stok
                $stockLog = StockLog::create([
                    'id' => (string) Str::uuid(),
                    'product_id' => $product->id,
                    'user_id' => $request->user()->id,
                    'type' => $validated['type'],
                    'quantity' => $validated['quantity'],
                    'stock_before' => $stockBefore,
                    'stock_after' => $stockAfter,
                    'reference_type' => 'manual_adjustment',
                    'notes' => $validated['notes'] ?? 'Penyesuaian stok manual',
                ]);

                return $stockLog->load(['product', 'user']);
            });

            return response()->json([
                'success' => true,
                'data' => $log,
                'message' => 'Stok produk berhasil diperbarui.'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        }
    }
}
