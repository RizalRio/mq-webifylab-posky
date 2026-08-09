<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Product;
use Illuminate\Support\Str;

class TenantIsolationTest extends TestCase
{
    // RefreshDatabase memastikan database di-reset (kosong) setiap kali test dijalankan
    use RefreshDatabase;

    /**
     * Skenario: 
     * Terdapat dua toko (Tenant A dan Tenant B).
     * Saat User dari Tenant A login, dia hanya boleh melihat produk milik Tenant A.
     */
    public function test_tenant_can_only_access_their_own_data()
    {
        // 1. SETUP DATA (Menyiapkan skenario)
        $tenantA = Tenant::create([
            'id' => Str::uuid(),
            'name' => 'Toko Suka Maju',
            'subdomain' => 'sukamaju',
            'business_type' => 'barang',
        ]);

        $tenantB = Tenant::create([
            'id' => Str::uuid(),
            'name' => 'Toko Makmur Jaya',
            'subdomain' => 'makmurjaya',
            'business_type' => 'barang',
        ]);

        $userA = User::create([
            'id' => Str::uuid(),
            'tenant_id' => $tenantA->id,
            'name' => 'Admin Suka Maju',
            'email' => 'admin@sukamaju.com',
            'password' => bcrypt('password123'),
        ]);

        // Menyuntikkan 2 produk untuk Tenant A
        Product::create([
            'id' => Str::uuid(),
            'tenant_id' => $tenantA->id,
            'name' => 'Kopi Arabica',
            'sku' => 'KOP-01',
            'stock' => 10,
            'cost_price' => 50000,
            'min_stock_threshold' => 2,
            'sell_price' => 55000
        ]);
        Product::create([
            'id' => Str::uuid(),
            'tenant_id' => $tenantA->id,
            'name' => 'Gula Pasir',
            'sku' => 'GUL-01',
            'stock' => 50,
            'cost_price' => 30000,
            'min_stock_threshold' => 5,
            'sell_price' => 35000
        ]);

        // Menyuntikkan 1 produk rahasia untuk Tenant B
        Product::create([
            'id' => Str::uuid(),
            'tenant_id' => $tenantB->id,
            'name' => 'Buku Kas',
            'sku' => 'BUK-01',
            'stock' => 5,
            'cost_price' => 20000,
            'min_stock_threshold' => 1,
            'sell_price' => 25000
        ]);


        // 2. ACTION (Bertindak sebagai User A)
        $this->actingAs($userA);

        // Menjalankan query biasa tanpa WHERE
        $products = Product::all();


        // 3. ASSERTION (Validasi Hasil)

        // Memastikan yang terbaca hanya 2 produk (bukan 3)
        $this->assertCount(2, $products, 'Sistem gagal mengisolasi data, produk Tenant B ikut terbaca!');

        // Memastikan produk milik Tenant B sama sekali tidak ada di dalam koleksi
        $this->assertFalse(
            $products->contains('name', 'Buku Kas'),
            'Bocor! User A bisa melihat barang milik User B.'
        );
    }
}
