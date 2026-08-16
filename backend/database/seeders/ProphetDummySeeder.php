<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Models\Tenant;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\User;

class ProphetDummySeeder extends Seeder
{
    public function run(): void
    {
        $tenants = Tenant::all();

        if ($tenants->isEmpty()) {
            $this->command->error("Tenant ID tidak ditemukan.");
            return;
        }

        foreach ($tenants as $tenant) {
            $tenantId = $tenant->id;
            $user = User::where('tenant_id', $tenantId)->first();
            $cashierId = $user ? $user->id : Str::uuid();

            $this->command->info("Menyiapkan skenario Prophet Time-Series untuk Tenant: {$tenant->name} ({$tenantId})");

            // Ambil produk milik tenant atau buat jika belum ada
            $products = Product::where('tenant_id', $tenantId)->get();

            if ($products->isEmpty()) {
                $product = Product::create([
                    'id' => Str::uuid(),
                    'tenant_id' => $tenantId,
                    'name' => 'Beras Pandan Wangi 5kg',
                    'sku' => 'BRS-PW-' . rand(100, 999),
                    'stock' => 50,
                    'cost_price' => 50000,
                    'sell_price' => 75000,
                ]);
                $products = collect([$product]);
            }

            foreach ($products as $product) {
                $simulatedPrice = $product->sell_price ?: 75000;

                // Suntikkan transaksi historis mundur selama 30 hari untuk setiap produk
                for ($i = 30; $i >= 1; $i--) {
                    $transactionDate = Carbon::now()->subDays($i);
                    $qtySold = rand(2, 6);

                    $transaction = Transaction::create([
                        'id' => Str::uuid(),
                        'tenant_id' => $tenantId,
                        'cashier_id' => $cashierId,
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
                        'unit_price' => $simulatedPrice,
                        'subtotal' => $simulatedPrice * $qtySold,
                        'created_at' => $transactionDate,
                        'updated_at' => $transactionDate
                    ]);
                }
            }
        }

        $this->command->info("✅ 30 Hari transaksi historis berhasil disuntikkan ke seluruh tenant!");
    }
}
