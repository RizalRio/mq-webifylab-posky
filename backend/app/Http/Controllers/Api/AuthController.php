<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * POST /auth/register
     */
    public function register(Request $request)
    {
        // Validasi Input
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'subdomain' => 'required|string|max:100|unique:tenants|regex:/^[a-z0-9-]+$/',
            'business_type' => 'required|in:barang,jasa,persewaan,hybrid',
        ]);

        try {
            // DB Transaction untuk menjamin integritas ACID
            $result = DB::transaction(function () use ($validated) {

                // Buat Tenant Baru
                $tenant = Tenant::create([
                    'id' => (string) Str::uuid(),
                    'name' => $validated['name'],
                    'subdomain' => $validated['subdomain'],
                    'business_type' => $validated['business_type'],
                ]);

                // Buat User (Admin Pertama) untuk Tenant tersebut
                $user = User::create([
                    'id' => (string) Str::uuid(),
                    'tenant_id' => $tenant->id,
                    'name' => 'Admin', // Nama default
                    'email' => $validated['email'],
                    'password' => Hash::make($validated['password']), // Hash Password dengan Bcrypt
                    'role' => 'admin',
                ]);

                return ['tenant' => $tenant, 'user' => $user];
            });

            // Terbitkan Token Sanctum
            $token = $result['user']->createToken('auth_token')->plainTextToken;

            // Return format sesuai API Docs
            return response()->json([
                'success' => true,
                'data' => [
                    'tenant' => $result['tenant'],
                    'user' => $result['user'],
                    'token' => $token
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mendaftar: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /auth/login
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Rate Limiting: Cegah Brute Force (Max 5 percobaan per menit per IP)
        $throttleKey = Str::transliterate(Str::lower($request->email) . '|' . $request->ip());

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return response()->json([
                'success' => false,
                'message' => "Terlalu banyak percobaan login. Silakan coba lagi dalam $seconds detik."
            ], 429);
        }

        // Verifikasi Kredensial
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            // Catat kegagalan login
            RateLimiter::hit($throttleKey);

            throw ValidationException::withMessages([
                'email' => ['Kredensial tidak valid.'],
            ]);
        }

        // Bersihkan cache Rate Limiter setelah sukses login
        RateLimiter::clear($throttleKey);

        // Hapus token lama agar satu akun hanya bisa login di satu device (Opsional/Tergantung Kebijakan)
        // $user->tokens()->delete(); 

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
                'token' => $token
            ]
        ], 200);
    }

    /**
     * POST /auth/logout
     */
    public function logout(Request $request)
    {
        // Cabut / Hapus token yang sedang digunakan
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ], 200);
    }
}
