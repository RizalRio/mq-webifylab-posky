<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Skenario 1: Registrasi Pengguna Baru & Tenant Berhasil
     */
    public function test_user_can_register_successfully()
    {
        $payload = [
            'name' => 'Toko Fotokopi Merdeka',
            'email' => 'owner@fotokopimerdeka.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'subdomain' => 'fotokopi-merdeka',
            'business_type' => 'jasa',
        ];

        $response = $this->postJson('/api/auth/register', $payload);

        // 1. Assert HTTP Status 201 Created
        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'success',
                'data' => [
                    'tenant' => ['id', 'name', 'subdomain', 'business_type'],
                    'user' => ['id', 'name', 'email', 'tenant_id', 'role'],
                    'token'
                ]
            ]);

        // 2. Pastikan Tenant tersimpan di database
        $this->assertDatabaseHas('tenants', [
            'subdomain' => 'fotokopi-merdeka',
            'business_type' => 'jasa',
        ]);

        // 3. Pastikan User terdaftar dan terhubung ke tenant
        $this->assertDatabaseHas('users', [
            'email' => 'owner@fotokopimerdeka.com',
            'role' => 'admin',
        ]);
    }

    /**
     * Skenario 2: Registrasi Gagal Karena Validasi (Subdomain / Email Duplikat)
     */
    public function test_registration_fails_if_email_or_subdomain_already_exists()
    {
        // Buat tenant & user eksis terlebih dahulu
        $tenant = Tenant::create([
            'id' => (string) Str::uuid(),
            'name' => 'Toko Pertama',
            'subdomain' => 'tokopertama',
            'business_type' => 'barang',
        ]);

        User::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $tenant->id,
            'name' => 'Admin 1',
            'email' => 'existing@tokopertama.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        // Coba daftar dengan email dan subdomain yang sama
        $payload = [
            'name' => 'Toko Duplikat',
            'email' => 'existing@tokopertama.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'subdomain' => 'tokopertama',
            'business_type' => 'barang',
        ];

        $response = $this->postJson('/api/auth/register', $payload);

        // 1. Assert status 422 Unprocessable Entity
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'subdomain']);
    }

    /**
     * Skenario 3: Login Berhasil dengan Kredensial Valid
     */
    public function test_user_can_login_with_valid_credentials()
    {
        $tenant = Tenant::create([
            'id' => (string) Str::uuid(),
            'name' => 'Persewaan Kamera Jaya',
            'subdomain' => 'kamerajaya',
            'business_type' => 'persewaan',
        ]);

        $user = User::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $tenant->id,
            'name' => 'Kasir Kamera',
            'email' => 'kasir@kamerajaya.com',
            'password' => Hash::make('secret12345'),
            'role' => 'staff',
        ]);

        $payload = [
            'email' => 'kasir@kamerajaya.com',
            'password' => 'secret12345',
        ];

        $response = $this->postJson('/api/auth/login', $payload);

        // 1. Assert status 200 OK & mendapatkan token Sanctum
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'success',
                'data' => [
                    'user' => ['id', 'name', 'email', 'tenant_id'],
                    'token'
                ]
            ]);
    }

    /**
     * Skenario 4: Login Gagal Karena Password Salah
     */
    public function test_login_fails_with_invalid_password()
    {
        $tenant = Tenant::create([
            'id' => (string) Str::uuid(),
            'name' => 'Bengkel Sejahtera',
            'subdomain' => 'bengkelsejahtera',
            'business_type' => 'jasa',
        ]);

        User::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $tenant->id,
            'name' => 'Montir Utama',
            'email' => 'montir@bengkelsejahtera.com',
            'password' => Hash::make('benarkunci123'),
            'role' => 'staff',
        ]);

        $payload = [
            'email' => 'montir@bengkelsejahtera.com',
            'password' => 'passwordsalah!',
        ];

        $response = $this->postJson('/api/auth/login', $payload);

        // Assert 422 Unprocessable Entity
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * Skenario 5: Logout Berhasil Menggugurkan Token Sanctum
     */
    public function test_authenticated_user_can_logout()
    {
        $tenant = Tenant::create([
            'id' => (string) Str::uuid(),
            'name' => 'Salon Kecantikan',
            'subdomain' => 'salonkecantikan',
            'business_type' => 'jasa',
        ]);

        $user = User::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $tenant->id,
            'name' => 'Kasir Salon',
            'email' => 'kasir@salonkecantikan.com',
            'password' => Hash::make('password123'),
            'role' => 'staff',
        ]);

        // Buat token autentikasi Sanctum
        $token = $user->createToken('auth_token')->plainTextToken;

        // Tembak endpoint logout dengan Bearer Token
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/auth/logout');

        // 1. Assert HTTP Status 200 OK
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Logged out successfully'
            ]);

        // 2. Pastikan token telah terhapus di database personal_access_tokens
        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
        ]);
    }
}
