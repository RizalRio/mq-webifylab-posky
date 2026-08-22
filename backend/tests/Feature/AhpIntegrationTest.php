<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Illuminate\Support\Facades\Redis;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Supplier;
use Illuminate\Support\Str;

class AhpIntegrationTest extends TestCase
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

        // Setup Tenant Lain (Untuk pengujian isolasi data)
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
     * Skenario: Memicu proses kalkulasi AHP harus berhasil mendorong pesan ke Redis (mock).
     */
    public function test_trigger_ahp_calculation_pushes_to_redis()
    {
        // Setup Redis Mock
        Redis::shouldReceive('connection')
            ->once()
            ->with('microservice')
            ->andReturnSelf();

        Redis::shouldReceive('lpush')
            ->once()
            ->withArgs(function ($queue, $payload) {
                if ($queue !== 'posky:ahp_tasks') return false;
                
                $data = json_decode($payload, true);
                return isset($data['tenant_id']) && $data['tenant_id'] === $this->tenant->id;
            });

        // Act
        $response = $this->actingAs($this->user)->postJson('/api/ahp/calculate');

        // Assert
        $response->assertStatus(202)
            ->assertJson([
                'success' => true,
                'message' => 'Proses kalkulasi AHP sedang berjalan di latar belakang.'
            ]);
    }

    /**
     * Skenario: Mengambil data rekomendasi AHP harus diurutkan dengan benar dan hanya menampilkan data milik tenant.
     */
    public function test_get_ahp_recommendations_ordered_by_rank_and_isolated()
    {
        // 1. Buat Supplier di Tenant Utama (Ada yang memiliki Rank, ada yang Null)
        Supplier::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->tenant->id,
            'name' => 'Supplier C',
            'phone' => '000003',
            'address' => 'Addr C',
            'rank' => 3,
            'ahp_score' => 0.4
        ]);
        
        Supplier::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->tenant->id,
            'name' => 'Supplier A',
            'phone' => '000001',
            'address' => 'Addr A',
            'rank' => 1,
            'ahp_score' => 0.8
        ]);

        Supplier::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->tenant->id,
            'name' => 'Supplier B',
            'phone' => '000002',
            'address' => 'Addr B',
            'rank' => 2,
            'ahp_score' => 0.6
        ]);

        Supplier::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->tenant->id,
            'name' => 'Supplier Z (Belum dinilai)',
            'phone' => '000009',
            'address' => 'Addr Z',
            'rank' => null, // If the database allows nullable rank, leave it. But ahp_score might not. Wait, the error said NOT NULL on ahp_score.
            'ahp_score' => 0.0 // Providing 0 instead of null
        ]);

        // 2. Buat Supplier di Tenant Lain (Jangan sampai muncul)
        Supplier::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->otherTenant->id,
            'name' => 'Supplier Alien',
            'phone' => '000004',
            'address' => 'Addr Alien',
            'rank' => 1,
            'ahp_score' => 0.9
        ]);

        // Act
        $response = $this->actingAs($this->user)->getJson('/api/ahp/recommendations');

        // Assert
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $data = $response->json('data');
        
        // Memastikan hanya 3 data yang muncul (Supplier Z yang rank NULL dan Supplier Alien beda tenant tidak diikutsertakan)
        $this->assertCount(3, $data);

        // Memastikan urutannya benar (Rank 1, 2, 3)
        $this->assertEquals('Supplier A', $data[0]['name']);
        $this->assertEquals('Supplier B', $data[1]['name']);
        $this->assertEquals('Supplier C', $data[2]['name']);
    }

    /**
     * Skenario: Jika belum ada perhitungan AHP, kembalikan pesan kosong secara graceful.
     */
    public function test_get_ahp_recommendations_empty()
    {
        // Act
        $response = $this->actingAs($this->user)->getJson('/api/ahp/recommendations');

        // Assert
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Belum ada data rekomendasi. Silakan jalankan kalkulasi AHP terlebih dahulu.',
                'data' => []
            ]);
    }
}
