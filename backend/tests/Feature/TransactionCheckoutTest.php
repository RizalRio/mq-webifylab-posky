<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Product;
use Illuminate\Support\Str;

class TransactionCheckoutTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $tenant;
    protected $product;

    // Fungsi setUp() dijalankan otomatis SEBELUM setiap test di bawahnya dimulai
    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::create([
            'id' => Str::uuid(),
            'name' => 'Toko Alat Tulis',
            'subdomain' => 'alattulis',
            'business_type' => 'barang',
        ]);

        $this->user = User::create([
            'id' => Str::uuid(),
            'tenant_id' => $this->tenant->id,
            'name' => 'Kasir Utama',
            'email' => 'kasir@alattulis.com',
            'password' => bcrypt('password123'),
        ]);

        $this->product = Product::create([
            'id' => Str::uuid(),
            'tenant_id' => $this->tenant->id,
            'name' => 'Pena Hitam',
            'sku' => 'PEN-01',
            'stock' => 10, // Modal stok awal adalah 10
            'category' => 'Alat Tulis',
            'min_stock_threshold' => 2,
            'sell_price' => 5000,
            'cost_price' => 3000,
        ]);
    }

    /**
     * Skenario 1: Transaksi Normal
     */
    public function test_successful_checkout_deducts_stock()
    {
        // Bertindak sebagai kasir yang login
        $this->actingAs($this->user);

        // Simulasi payload JSON dari frontend (membeli 3 buah Pena)
        $payload = [
            'type' => 'barang',
            'items' => [
                [
                    'itemable_id' => $this->product->id,
                    'itemable_type' => 'product',
                    'quantity' => 3,
                    'unit_price' => 5000
                ]
            ],
            'total_amount' => 15000,
            'payment_method' => 'cash'
        ];

        // Tembak endpoint transaksi
        $response = $this->postJson('/api/transactions', $payload);

        // 1. Pastikan API merespons dengan status 201 Created
        $response->assertStatus(201);

        // 2. Pastikan stok di database berkurang (10 - 3 = 7)
        $this->assertDatabaseHas('products', [
            'id' => $this->product->id,
            'stock' => 7
        ]);

        // 3. Pastikan transaksi tercatat
        $this->assertDatabaseHas('transactions', [
            'tenant_id' => $this->tenant->id,
            'total_amount' => 15000
        ]);
    }

    /**
     * Skenario 2: Pencegahan Overselling
     */
    public function test_checkout_fails_if_stock_is_insufficient()
    {
        $this->actingAs($this->user);

        // Simulasi membeli 15 buah, padahal stok hanya 10
        $payload = [
            'type' => 'barang',
            'items' => [
                [
                    'itemable_id' => $this->product->id,
                    'itemable_type' => 'product',
                    'quantity' => 15,
                    'unit_price' => 5000
                ]
            ],
            'total_amount' => 75000,
            'payment_method' => 'cash'
        ];

        $response = $this->postJson('/api/transactions', $payload);

        // 1. Pastikan API menolak dengan status 422 Unprocessable Entity
        $response->assertStatus(422);

        // 2. Pastikan stok TETAP 10 (tidak berubah jadi minus)
        $this->assertDatabaseHas('products', [
            'id' => $this->product->id,
            'stock' => 10
        ]);

        // 3. Pastikan tidak ada transaksi abal-abal yang terbuat di database
        $this->assertDatabaseMissing('transactions', [
            'tenant_id' => $this->tenant->id,
            'total_amount' => 75000
        ]);
    }
}
