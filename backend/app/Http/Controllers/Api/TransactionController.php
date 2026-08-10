<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Product;
use App\Models\RentalItem;
use App\Models\Service;
use App\Models\RentalBooking;
use App\Models\ServiceSchedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class TransactionController extends Controller
{
    /**
     * GET /transactions
     * Riwayat transaksi kasir dengan filter & paginasi
     */
    public function index(Request $request)
    {
        $query = Transaction::with(['customer', 'cashier', 'items.itemable', 'items.rentalBooking', 'items.serviceSchedule']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('id', 'ilike', "%{$search}%")
                  ->orWhereHas('customer', function ($cq) use ($search) {
                      $cq->where('name', 'ilike', "%{$search}%");
                  });
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        $sort = $request->input('sort', 'created_at');
        $order = $request->input('order', 'desc');
        $query->orderBy($sort, $order === 'asc' ? 'asc' : 'desc');

        $transactions = $query->paginate($request->input('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $transactions->items(),
            'meta' => [
                'page' => $transactions->currentPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total(),
                'last_page' => $transactions->lastPage()
            ]
        ]);
    }

    /**
     * GET /transactions/{id}
     * Detail transaksi spesifik
     */
    public function show($id)
    {
        $transaction = Transaction::with(['customer', 'cashier', 'items.itemable', 'items.rentalBooking', 'items.serviceSchedule'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $transaction
        ]);
    }

    public function store(Request $request)
    {
        // 1. Validasi Input Payload yang Diperluas
        $validated = $request->validate([
            'customer_id' => 'nullable|uuid',
            'type' => 'required|string',
            'payment_method' => 'required|string',
            'discount' => 'numeric|min:0',
            'tax' => 'numeric|min:0',
            'deposit_paid' => 'numeric|min:0', // Tambahan untuk Persewaan
            'items' => 'required|array|min:1',
            'items.*.itemable_type' => 'required|string',
            'items.*.itemable_id' => 'required|uuid',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',

            // Kolom opsional khusus Mode Jasa
            'items.*.scheduled_start' => 'nullable|date',
            'items.*.technician_id' => 'nullable|uuid',

            // Kolom opsional khusus Mode Persewaan
            'items.*.start_date' => 'nullable|date',
            'items.*.end_date' => 'nullable|date',
        ]);

        // Normalisasi itemable_type (Mendukung alias pendek seperti 'product', 'rental_item', 'service' maupun FQCN)
        $validated['items'] = collect($validated['items'])->map(function ($item) {
            $type = strtolower($item['itemable_type']);
            if (in_array($type, ['product', 'barang', 'app\models\product'])) {
                $item['itemable_type'] = Product::class;
            } elseif (in_array($type, ['rental_item', 'rentalitem', 'rental', 'persewaan', 'app\models\rentalitem'])) {
                $item['itemable_type'] = RentalItem::class;
            } elseif (in_array($type, ['service', 'jasa', 'app\models\service'])) {
                $item['itemable_type'] = Service::class;
            }
            return $item;
        })->toArray();

        $hasRental = collect($validated['items'])->contains('itemable_type', RentalItem::class);

        if ($hasRental && empty($validated['customer_id'])) {
            return response()->json([
                'success' => false,
                'message' => 'Identitas pelanggan (customer_id) wajib diisi untuk transaksi penyewaan guna mencegah risiko kehilangan aset.'
            ], 422);
        }

        try {
            $transaction = DB::transaction(function () use ($validated, $request) {
                $subtotal = 0;
                $depositPaid = $validated['deposit_paid'] ?? 0;

                // --- LOOPING 1: VALIDASI FAIL-FAST & PENGUNCIAN ---
                foreach ($validated['items'] as $item) {
                    $subtotal += ($item['quantity'] * $item['unit_price']);

                    // Mode Barang
                    if ($item['itemable_type'] === 'App\\Models\\Product') {
                        $product = Product::lockForUpdate()->find($item['itemable_id']);
                        if (!$product)
                            throw new \Exception("Produk tidak ditemukan.");
                        if ($product->stock < $item['quantity']) {
                            throw new \Exception("Stok tidak cukup untuk produk: {$product->name}.");
                        }
                    }

                    // Mode Persewaan
                    if ($item['itemable_type'] === 'App\\Models\\RentalItem') {
                        $rentalItem = RentalItem::lockForUpdate()->find($item['itemable_id']);
                        if (!$rentalItem)
                            throw new \Exception("Item rental tidak ditemukan.");
                        if ($rentalItem->status !== 'available') {
                            throw new \Exception("Item {$rentalItem->name} sedang disewa atau dalam perbaikan.");
                        }
                    }

                    // Mode Jasa
                    if ($item['itemable_type'] === 'App\\Models\\Service') {
                        $service = Service::find($item['itemable_id']);
                        if (!$service)
                            throw new \Exception("Layanan jasa tidak ditemukan.");
                    }
                }

                $discount = $validated['discount'] ?? 0;
                $tax = $validated['tax'] ?? 0;
                // Total tidak ditambah deposit karena deposit dikembalikan, namun pencatatan transaksi bisa disesuaikan
                $totalAmount = $subtotal - $discount + $tax;

                // --- PEMBUATAN HEADER TRANSAKSI ---
                $transaction = Transaction::create([
                    'id' => (string) Str::uuid(),
                    'customer_id' => $validated['customer_id'] ?? null,
                    'cashier_id' => $request->user()->id,
                    'type' => $validated['type'],
                    'subtotal' => $subtotal,
                    'discount' => $discount,
                    'tax' => $tax,
                    'total_amount' => $totalAmount,
                    'payment_method' => $validated['payment_method'],
                    'status' => 'completed',
                ]);

                // Jika ada deposit pada transaksi sewa, kita bisa menyimpannya (jika butuh dicatat di header, tambahkan kolom deposit di migrasi header transaksi nantinya. Untuk saat ini kita gunakan variabel).

                // --- LOOPING 2: INSERT DETAIL & EFEK SAMPING ---
                foreach ($validated['items'] as $item) {
                    $itemSubtotal = $item['quantity'] * $item['unit_price'];

                    $transactionItem = $transaction->items()->create([
                        'id' => (string) Str::uuid(),
                        'itemable_type' => $item['itemable_type'],
                        'itemable_id' => $item['itemable_id'],
                        'quantity' => $item['quantity'],
                        'unit_price' => $item['unit_price'],
                        'subtotal' => $itemSubtotal,
                    ]);

                    // Efek Samping Mode Barang
                    if ($item['itemable_type'] === 'App\\Models\\Product') {
                        $product = Product::find($item['itemable_id']);
                        $product->stock -= $item['quantity'];
                        $product->save();
                    }

                    // Efek Samping Mode Persewaan
                    if ($item['itemable_type'] === 'App\\Models\\RentalItem') {
                        $rentalItem = RentalItem::find($item['itemable_id']);
                        $rentalItem->status = 'rented';
                        $rentalItem->save();

                        RentalBooking::create([
                            'id' => (string) Str::uuid(),
                            'transaction_item_id' => $transactionItem->id,
                            'rental_item_id' => $rentalItem->id,
                            'start_date' => $item['start_date'],
                            'end_date' => $item['end_date'],
                        ]);
                    }

                    // Efek Samping Mode Jasa
                    if ($item['itemable_type'] === 'App\\Models\\Service') {
                        $service = Service::find($item['itemable_id']);

                        // Hitung waktu selesai berdasarkan durasi layanan
                        $startTime = Carbon::parse($item['scheduled_start']);
                        $endTime = clone $startTime;
                        $endTime->addMinutes($service->duration_minutes);

                        ServiceSchedule::create([
                            'id' => (string) Str::uuid(),
                            'transaction_item_id' => $transactionItem->id,
                            'technician_id' => $item['technician_id'] ?? null,
                            'scheduled_start' => $startTime,
                            'scheduled_end' => $endTime,
                            'status' => 'scheduled',
                        ]);
                    }
                }

                // --- EFEK SAMPING UPDATE METRIK RFM PELANGGAN ---
                if (!empty($validated['customer_id'])) {
                    $customer = \App\Models\Customer::find($validated['customer_id']);
                    if ($customer) {
                        $customer->total_transactions = ($customer->total_transactions ?? 0) + 1;
                        $customer->total_spent = ($customer->total_spent ?? 0) + $totalAmount;
                        $customer->last_transaction_at = now();

                        if ($customer->total_transactions >= 10 || $customer->total_spent >= 5000000) {
                            $customer->rfm_segment = 'Champions';
                        } elseif ($customer->total_transactions >= 5 || $customer->total_spent >= 1000000) {
                            $customer->rfm_segment = 'Loyal';
                        } elseif ($customer->total_transactions >= 2) {
                            $customer->rfm_segment = 'Recent Customers';
                        } else {
                            $customer->rfm_segment = 'New';
                        }

                        $customer->save();
                    }
                }

                return $transaction->load('items');
            });

            return response()->json([
                'success' => true,
                'data' => $transaction,
                'message' => 'Transaksi berhasil diproses.'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * POST /transactions/{id}/return
     * Proses pengembalian item sewa dan perhitungan denda
     */
    public function returnRental(Request $request, $id)
    {
        // 1. Validasi input dari kasir
        $validated = $request->validate([
            'actual_return_date' => 'required|date',
            'condition' => 'nullable|string|max:255',
            'notes' => 'nullable|string'
        ]);

        try {
            $result = DB::transaction(function () use ($request, $id, $validated) {
                // Cari header transaksi beserta detail item dan relasi booking-nya
                $transaction = Transaction::with(['items.itemable', 'items.rentalBooking'])->findOrFail($id);

                $totalLateFee = 0;
                $totalDeposit = 0;
                $maxExpectedReturnDate = null;
                $daysLate = 0;

                // 2. Looping setiap item di dalam transaksi ini
                foreach ($transaction->items as $item) {

                    // Kita hanya memproses item yang berjenis Persewaan
                    if ($item->itemable_type === 'App\\Models\\RentalItem') {
                        $rentalItem = $item->itemable;
                        $booking = $item->rentalBooking;

                        if (!$booking) {
                            continue; // Lewati jika tidak ada data booking
                        }

                        // Cegah pengembalian ganda
                        if ($booking->actual_return_date !== null) {
                            throw new \Exception("Item {$rentalItem->name} sudah dikembalikan sebelumnya.");
                        }

                        // Akumulasi total deposit dari barang yang disewa
                        $totalDeposit += $rentalItem->deposit_amount;

                        // 3. Kalkulasi Tanggal Menggunakan Carbon
                        $expectedReturn = Carbon::parse($booking->end_date);
                        $actualReturn = Carbon::parse($validated['actual_return_date']);

                        // Simpan tanggal ekspektasi paling lama untuk keperluan rekap data
                        if (is_null($maxExpectedReturnDate) || $expectedReturn->gt($maxExpectedReturnDate)) {
                            $maxExpectedReturnDate = $expectedReturn;
                        }

                        $itemLateFee = 0;

                        // Jika tanggal kembali lebih besar (melewati) tanggal ekspektasi
                        if ($actualReturn->gt($expectedReturn)) {
                            $itemDaysLate = $actualReturn->diffInDays($expectedReturn);

                            // Ambil jumlah hari keterlambatan paling lama sebagai acuan rekap
                            if ($itemDaysLate > $daysLate) {
                                $daysLate = $itemDaysLate;
                            }

                            // Rumus denda: Hari Terlambat x Tarif Harian[cite: 1]
                            $itemLateFee = $itemDaysLate * $rentalItem->daily_rate;
                            $totalLateFee += $itemLateFee;
                        }

                        // 4. Update data di tabel rental_bookings
                        $booking->actual_return_date = $actualReturn->format('Y-m-d');
                        $booking->late_fee = $itemLateFee;
                        // notes dan condition bisa disimpan ke tabel booking jika kolomnya sudah ditambahkan di migrasi
                        $booking->save();

                        // 5. Update status barang sewaan kembali menjadi 'available'[cite: 1, 4]
                        $rentalItem->status = 'available';
                        $rentalItem->save();
                    }
                }

                // Jika total deposit masih lebih besar dari denda, potong deposit. 
                // Jika denda lebih besar dari deposit, refund 0 dan sisanya dianggap sebagai tagihan tambahan.
                $depositRefund = max(0, $totalDeposit - $totalLateFee);

                // Total tagihan adalah harga sewa awal (total_amount) + denda
                $totalCharged = $transaction->total_amount + $totalLateFee;

                return [
                    'transaction_id' => $transaction->id,
                    'actual_return_date' => $validated['actual_return_date'],
                    'expected_return_date' => $maxExpectedReturnDate ? $maxExpectedReturnDate->format('Y-m-d') : null,
                    'days_late' => $daysLate,
                    'late_fee' => $totalLateFee,
                    'deposit_refund' => $depositRefund,
                    'total_charged' => $totalCharged
                ];
            });

            // Kembalikan response sesuai dengan spesifikasi Blueprint API[cite: 1]
            return response()->json([
                'success' => true,
                'data' => $result
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses pengembalian: ' . $e->getMessage()
            ], 422);
        }
    }
}
