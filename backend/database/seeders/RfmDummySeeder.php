<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\Customer;
use App\Models\Transaction;

class RfmDummySeeder extends Seeder
{
    public function run(): void
    {
        $tenantId = DB::table('users')->value('tenant_id');

        if (!$tenantId) {
            $this->command->error("Tenant ID tidak ditemukan.");
            return;
        }

        $this->command->info("Menyiapkan skenario segmentasi RFM untuk Tenant: {$tenantId}");

        // 1. Skenario "Champions" (Beli baru-baru ini, sangat sering, dan nominal besar)
        $champion = Customer::create([
            'id' => Str::uuid(),
            'tenant_id' => $tenantId,
            'name' => 'Budi (Sultan Toko)',
            'phone' => '0811111111',
        ]);

        // Budi melakukan 25 transaksi dalam 2 minggu terakhir
        for ($i = 1; $i <= 25; $i++) {
            Transaction::create([
                'id' => Str::uuid(),
                'tenant_id' => $tenantId,
                'customer_id' => $champion->id,
                'cashier_id' => DB::table('users')->value('id'),
                'type' => 'sale',
                'subtotal' => 250000, // Total belanja akan mencapai > 6 juta
                'discount' => 0,
                'tax' => 0,
                'total_amount' => 250000, // Total belanja akan mencapai > 6 juta
                'payment_method' => 'cash',
                'status' => 'completed',
                'created_at' => Carbon::now()->subDays(rand(1, 14)),
                'updated_at' => Carbon::now()->subDays(rand(1, 14)),
            ]);
        }

        // 2. Skenario "Lost" (Beli sudah sangat lama, frekuensi dan nominal rendah)
        $lost = Customer::create([
            'id' => Str::uuid(),
            'tenant_id' => $tenantId,
            'name' => 'Andi (Mantan Pelanggan)',
            'phone' => '0822222222',
        ]);

        Transaction::create([
            'id' => Str::uuid(),
            'tenant_id' => $tenantId,
            'customer_id' => $lost->id,
            'cashier_id' => DB::table('users')->value('id'),
            'type' => 'sale',
            'subtotal' => 150000,
            'discount' => 0,
            'tax' => 0,
            'total_amount' => 150000,
            'payment_method' => 'cash',
            'status' => 'completed',
            'created_at' => Carbon::now()->subDays(150), // 5 bulan yang lalu
            'updated_at' => Carbon::now()->subDays(150),
        ]);

        // 3. Skenario "Recent Customers" (Baru saja beli, tapi baru pertama kali)
        $recent = Customer::create([
            'id' => Str::uuid(),
            'tenant_id' => $tenantId,
            'name' => 'Citra (Pelanggan Baru)',
            'phone' => '0833333333',
        ]);

        Transaction::create([
            'id' => Str::uuid(),
            'tenant_id' => $tenantId,
            'customer_id' => $recent->id,
            'cashier_id' => DB::table('users')->value('id'),
            'type' => 'sale',
            'subtotal' => 50000,
            'discount' => 0,
            'tax' => 0,
            'total_amount' => 50000,
            'payment_method' => 'cash',
            'status' => 'completed',
            'created_at' => Carbon::now()->subDays(2), // 2 hari yang lalu
            'updated_at' => Carbon::now()->subDays(2),
        ]);

        $this->command->info("✅ Data Pelanggan dan Transaksi RFM berhasil disuntikkan!");
    }
}
