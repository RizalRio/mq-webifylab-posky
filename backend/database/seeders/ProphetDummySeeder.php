<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;

class ProphetDummySeeder extends Seeder
{
    public function run(): void
    {
        $tenantId = DB::table('users')->value('tenant_id');

        if (!$tenantId) {
            $this->command->error("Tenant ID tidak ditemukan.");
            return;
        }

        $this->command->info("Menyiapkan skenario Prophet Time-Series untuk Tenant: {$tenantId}");

        // 1. Buat 1 Produk Dummy dengan sisa stok 50
        // HAPUS kolom 'price' karena tidak ada di skema database kamu
        $product = Product::create([
            'id' => Str::uuid(),
            'tenant_id' => $tenantId,
            'name' => 'Beras Pandan Wangi 5kg',
            'sku' => 'BRS-PW-001',
            'stock' => 50,
            'cost_price' => 50000,
            'sell_price' => 75000,
        ]);

        // 2. Tentukan harga simulasi secara manual di dalam variabel
        $simulatedPrice = 75000;

        // 3. Suntikkan transaksi historis mundur selama 30 hari
        for ($i = 30; $i >= 1; $i--) {
            $transactionDate = Carbon::now()->subDays($i);
            $qtySold = rand(1, 5);

            $transaction = Transaction::create([
                'id' => Str::uuid(),
                'tenant_id' => $tenantId,
                'cashier_id' => DB::table('users')->value('id'),
                'type' => 'sale',
                'subtotal' => $simulatedPrice * $qtySold,
                'discount' => 0,
                'tax' => 0,
                'total_amount' => $simulatedPrice * $qtySold,
                'payment_method' => 'cash',
                'status' => 'completed',
                'created_at' => $transactionDate,
                'updated_at' => $transactionDate
            ]);

            TransactionItem::create([
                'id' => Str::uuid(),
                'transaction_id' => $transaction->id,
                'itemable_id' => $product->id,
                'itemable_type' => Product::class,
                'quantity' => $qtySold,
                'unit_price' => $simulatedPrice, // Pastikan kolom ini ada di tabel transaction_items
                'subtotal' => $simulatedPrice * $qtySold,
                'created_at' => $transactionDate,
                'updated_at' => $transactionDate
            ]);
        }

        $this->command->info("✅ 30 Hari transaksi historis berhasil disuntikkan!");
    }
}
