<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Buat atau dapatkan Tenant Demo untuk Developer
        $tenant = Tenant::firstOrCreate(
            ['subdomain' => 'demo'],
            [
                'id' => (string) Str::uuid(),
                'name' => 'POSKY Demo Store',
                'business_type' => 'hybrid',
            ]
        );

        // 2. Daftar User Developer / Pengetesan
        $users = [
            [
                'email' => 'admin@posky.com',
                'name' => 'Developer Admin',
                'role' => 'admin',
                'password' => Hash::make('password123'),
            ],
            [
                'email' => 'kasir@posky.com',
                'name' => 'Kasir Utama',
                'role' => 'kasir',
                'password' => Hash::make('password123'),
            ],
            [
                'email' => 'manajer@posky.com',
                'name' => 'Manajer Toko',
                'role' => 'manajer',
                'password' => Hash::make('password123'),
            ],
            [
                'email' => 'teknisi@posky.com',
                'name' => 'Teknisi Servis',
                'role' => 'teknisi',
                'password' => Hash::make('password123'),
            ],
        ];

        foreach ($users as $userData) {
            $existingUser = User::where('email', $userData['email'])->first();

            if ($existingUser) {
                $existingUser->update([
                    'name' => $userData['name'],
                    'role' => $userData['role'],
                    'password' => $userData['password'],
                    'tenant_id' => $tenant->id,
                ]);
            } else {
                User::create([
                    'id' => (string) Str::uuid(),
                    'tenant_id' => $tenant->id,
                    'name' => $userData['name'],
                    'email' => $userData['email'],
                    'role' => $userData['role'],
                    'password' => $userData['password'],
                    'email_verified_at' => now(),
                ]);
            }
        }

        $this->command->info('✅ Seeder User Developer berhasil dijalankan! (Credential: admin@posky.com / password123)');
    }
}
