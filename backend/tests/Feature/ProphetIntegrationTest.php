<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Illuminate\Support\Facades\Redis;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Product;
use App\Models\StockPrediction;
use Illuminate\Support\Str;

class ProphetIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected $tenant;
    protected $user;
    protected $otherTenant;
    protected $otherUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Setup Tenant Utama
        $this->tenant = Tenant::create([
            'id' => (string) Str::uuid(),
            'name' => 'Toko Utama',
            'subdomain' => 'utama',
            'business_type' => 'barang',
        ]);

        $this->user = User::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->tenant->id,
            'name' => 'Admin Utama',
            'email' => 'admin@utama.com',
            'password' => bcrypt('password123'),
            'role' => 'admin',
        ]);

        // Setup Tenant Lain
        $this->otherTenant = Tenant::create([
            'id' => (string) Str::uuid(),
            'name' => 'Toko Lain',
            'subdomain' => 'lain',
            'business_type' => 'barang',
        ]);

        $this->otherUser = User::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->otherTenant->id,
            'name' => 'Admin Lain',
            'email' => 'admin@lain.com',
            'password' => bcrypt('password123'),
            'role' => 'admin',
        ]);
    }

    /**
     * Skenario: Memicu proses Prophet harus berhasil mendorong pesan ke Redis (mock).
     */
    public function test_trigger_prophet_prediction_pushes_to_redis()
    {
        // Setup Redis Mock
        Redis::shouldReceive('connection')
            ->once()
            ->with('microservice')
            ->andReturnSelf();

        Redis::shouldReceive('lpush')
            ->once()
            ->withArgs(function ($queue, $payload) {
                if ($queue !== 'posky:prophet_tasks') return false;
                
                $data = json_decode($payload, true);
                return isset($data['tenant_id']) && $data['tenant_id'] === $this->tenant->id;
            });

        // Act
        $response = $this->actingAs($this->user)->postJson('/api/prophet/predict');

        // Assert
        $response->assertStatus(202)
            ->assertJson([
                'success' => true,
                'message' => 'Proses ekstraksi data historis dan prediksi stok AI sedang berjalan di latar belakang.'
            ]);
    }

    /**
     * Skenario: Mengambil data prediksi Prophet diurutkan berdasarkan tanggal kehabisan terdekat dan terisolasi.
     */
    public function test_get_prophet_predictions_ordered_and_isolated()
    {
        // 1. Buat Produk untuk Tenant Utama
        $productA = Product::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->tenant->id,
            'name' => 'Produk A',
            'sku' => 'SKU-A',
            'cost_price' => 5000,
            'sell_price' => 10000,
            'stock' => 50,
        ]);

        $productB = Product::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->tenant->id,
            'name' => 'Produk B',
            'sku' => 'SKU-B',
            'cost_price' => 10000,
            'sell_price' => 20000,
            'stock' => 100,
        ]);

        $productC = Product::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->tenant->id,
            'name' => 'Produk C',
            'sku' => 'SKU-C',
            'cost_price' => 20000,
            'sell_price' => 30000,
            'stock' => 10,
        ]);

        // Buat Produk untuk Tenant Lain
        $productAlien = Product::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->otherTenant->id,
            'name' => 'Produk Alien',
            'sku' => 'SKU-ALIEN',
            'cost_price' => 30000,
            'sell_price' => 50000,
            'stock' => 20,
        ]);

        // 2. Buat Prediksi Stok (StockPrediction)
        // Produk B akan habis paling lama (3 hari lagi)
        StockPrediction::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->tenant->id,
            'product_id' => $productB->id,
            'predicted_sales_velocity' => 5.0,
            'estimated_stockout_date' => now()->addDays(3)->toDateString(),
            'safety_stock_level' => 15,
        ]);

        // Produk C akan habis paling cepat (hari ini/besok)
        StockPrediction::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->tenant->id,
            'product_id' => $productC->id,
            'predicted_sales_velocity' => 10.0,
            'estimated_stockout_date' => now()->addDays(1)->toDateString(),
            'safety_stock_level' => 20,
        ]);

        // Produk A akan habis menengah (2 hari lagi)
        StockPrediction::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->tenant->id,
            'product_id' => $productA->id,
            'predicted_sales_velocity' => 2.0,
            'estimated_stockout_date' => now()->addDays(2)->toDateString(),
            'safety_stock_level' => 5,
        ]);

        // Prediksi Tenant Lain (Seharusnya tidak muncul)
        StockPrediction::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->otherTenant->id,
            'product_id' => $productAlien->id,
            'predicted_sales_velocity' => 8.0,
            'estimated_stockout_date' => now()->toDateString(), // Hari ini
            'safety_stock_level' => 10,
        ]);

        // Act
        $response = $this->actingAs($this->user)->getJson('/api/prophet/predictions');

        // Assert
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $data = $response->json('data');
        
        // Memastikan hanya 3 prediksi yang ditarik
        $this->assertCount(3, $data);

        // Memastikan urutan terdekat ke terlama (Produk C -> A -> B)
        $this->assertEquals($productC->id, $data[0]['product_id']);
        $this->assertEquals('Produk C', $data[0]['product']['name']);
        
        $this->assertEquals($productA->id, $data[1]['product_id']);
        $this->assertEquals('Produk A', $data[1]['product']['name']);

        $this->assertEquals($productB->id, $data[2]['product_id']);
        $this->assertEquals('Produk B', $data[2]['product']['name']);
    }

    /**
     * Skenario: Jika belum ada prediksi, kembalikan pesan kosong.
     */
    public function test_get_prophet_predictions_empty()
    {
        // Act
        $response = $this->actingAs($this->user)->getJson('/api/prophet/predictions');

        // Assert
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Belum ada data prediksi stok. AI sedang menganalisis atau data transaksi belum cukup.',
                'data' => []
            ]);
    }
}
