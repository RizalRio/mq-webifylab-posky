<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportController extends Controller
{
    /**
     * GET /api/reports/sales
     * Mengembalikan rekapitulasi penjualan (pendapatan, pajak, diskon, jumlah struk) per hari.
     */
    public function sales(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        
        // Default: 30 hari terakhir
        $startDate = $request->input('start_date', Carbon::now()->subDays(30)->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->toDateString());

        // Validasi
        if (Carbon::parse($startDate)->gt(Carbon::parse($endDate))) {
            return response()->json([
                'success' => false,
                'message' => 'Tanggal mulai tidak boleh lebih besar dari tanggal akhir.'
            ], 400);
        }

        $sales = Transaction::where('tenant_id', $tenantId)
            ->where('status', 'completed')
            ->whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(id) as total_transactions'),
                DB::raw('SUM(subtotal) as total_subtotal'),
                DB::raw('SUM(discount) as total_discount'),
                DB::raw('SUM(tax) as total_tax'),
                DB::raw('SUM(total_amount) as total_revenue')
            )
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        // Ringkasan global
        $summary = [
            'total_transactions' => $sales->sum('total_transactions'),
            'total_revenue' => $sales->sum('total_revenue'),
            'total_tax' => $sales->sum('total_tax'),
            'total_discount' => $sales->sum('total_discount'),
        ];

        return response()->json([
            'success' => true,
            'summary' => $summary,
            'data' => $sales
        ]);
    }

    /**
     * GET /api/reports/items
     * Mengembalikan daftar barang/jasa/sewa yang paling laku (Top Sellers).
     */
    public function items(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        
        $startDate = $request->input('start_date', Carbon::now()->subDays(30)->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->toDateString());

        // Join transactions untuk memfilter berdasarkan tenant_id & tanggal,
        // dan join ke tabel polimorfik (Product, Service, RentalItem) secara dinamis menggunakan Subqueries / DB::raw
        // Karena polimorfik sulit di-group by langsung jika namanya berbeda tabel,
        // kita akan tarik data mentah dan proses dengan collection.

        $items = DB::table('transaction_items')
            ->join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->where('transactions.tenant_id', $tenantId)
            ->where('transactions.status', 'completed')
            ->whereDate('transactions.created_at', '>=', $startDate)
            ->whereDate('transactions.created_at', '<=', $endDate)
            ->select(
                'transaction_items.itemable_id',
                'transaction_items.itemable_type',
                DB::raw('SUM(transaction_items.quantity) as total_quantity'),
                DB::raw('SUM(transaction_items.subtotal) as total_revenue')
            )
            ->groupBy('transaction_items.itemable_id', 'transaction_items.itemable_type')
            ->orderBy('total_quantity', 'desc')
            ->get();

        // Hidrasi nama item (Barang/Jasa/Sewa) menggunakan Eloquent
        $itemsWithNames = $items->map(function ($item) {
            $name = 'Item Tidak Ditemukan';
            $typeLabel = 'Unknown';
            
            // Map the type class to actual model instance to get the name
            if (str_contains($item->itemable_type, 'Product')) {
                $typeLabel = 'Barang';
                $product = DB::table('products')->where('id', $item->itemable_id)->first();
                if ($product) $name = $product->name;
            } elseif (str_contains($item->itemable_type, 'Service')) {
                $typeLabel = 'Jasa';
                $service = DB::table('services')->where('id', $item->itemable_id)->first();
                if ($service) $name = $service->name;
            } elseif (str_contains($item->itemable_type, 'RentalItem')) {
                $typeLabel = 'Sewa';
                $rental = DB::table('rental_items')->where('id', $item->itemable_id)->first();
                if ($rental) $name = $rental->name;
            }

            return [
                'id' => $item->itemable_id,
                'type' => $typeLabel,
                'name' => $name,
                'total_quantity' => (int) $item->total_quantity,
                'total_revenue' => (float) $item->total_revenue,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $itemsWithNames
        ]);
    }

    /**
     * GET /api/reports/export-pdf
     * Ekspor Laporan menjadi file PDF
     */
    public function exportPdf(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        
        $startDate = $request->input('start_date', Carbon::now()->subDays(30)->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->toDateString());

        // 1. Data Sales
        $sales = Transaction::where('tenant_id', $tenantId)
            ->where('status', 'completed')
            ->whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(id) as total_transactions'),
                DB::raw('SUM(subtotal) as total_subtotal'),
                DB::raw('SUM(discount) as total_discount'),
                DB::raw('SUM(tax) as total_tax'),
                DB::raw('SUM(total_amount) as total_revenue')
            )
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        $summary = [
            'total_transactions' => $sales->sum('total_transactions'),
            'total_revenue' => $sales->sum('total_revenue'),
            'total_tax' => $sales->sum('total_tax'),
            'total_discount' => $sales->sum('total_discount'),
        ];

        // 2. Data Items
        $itemsQuery = DB::table('transaction_items')
            ->join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->where('transactions.tenant_id', $tenantId)
            ->where('transactions.status', 'completed')
            ->whereDate('transactions.created_at', '>=', $startDate)
            ->whereDate('transactions.created_at', '<=', $endDate)
            ->select(
                'transaction_items.itemable_id',
                'transaction_items.itemable_type',
                DB::raw('SUM(transaction_items.quantity) as total_quantity'),
                DB::raw('SUM(transaction_items.subtotal) as total_revenue')
            )
            ->groupBy('transaction_items.itemable_id', 'transaction_items.itemable_type')
            ->orderBy('total_quantity', 'desc')
            ->get();

        $itemsWithNames = $itemsQuery->map(function ($item) {
            $name = 'Item Tidak Ditemukan';
            $typeLabel = 'Unknown';
            
            if (str_contains($item->itemable_type, 'Product')) {
                $typeLabel = 'Barang';
                $product = DB::table('products')->where('id', $item->itemable_id)->first();
                if ($product) $name = $product->name;
            } elseif (str_contains($item->itemable_type, 'Service')) {
                $typeLabel = 'Jasa';
                $service = DB::table('services')->where('id', $item->itemable_id)->first();
                if ($service) $name = $service->name;
            } elseif (str_contains($item->itemable_type, 'RentalItem')) {
                $typeLabel = 'Sewa';
                $rental = DB::table('rental_items')->where('id', $item->itemable_id)->first();
                if ($rental) $name = $rental->name;
            }

            return [
                'type' => $typeLabel,
                'name' => $name,
                'total_quantity' => (int) $item->total_quantity,
                'total_revenue' => (float) $item->total_revenue,
            ];
        });

        $pdf = Pdf::loadView('reports.pdf', [
            'startDate' => $startDate,
            'endDate' => $endDate,
            'sales' => $sales,
            'summary' => $summary,
            'items' => $itemsWithNames
        ]);
        
        return $pdf->download("Laporan_POSKY_{$startDate}_to_{$endDate}.pdf");
    }
}
