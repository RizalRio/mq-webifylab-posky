<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\Tenant;
use App\Models\Criterion;
use App\Models\Supplier;
use App\Models\CriterionComparison;
use App\Models\SupplierEvaluation;

class AhpDummySeeder extends Seeder
{
    public function run(): void
    {
        $tenants = Tenant::all();

        if ($tenants->isEmpty()) {
            $this->command->error("Tidak ditemukan tenant di database. Buat tenant terlebih dahulu.");
            return;
        }

        foreach ($tenants as $tenant) {
            $tenantId = $tenant->id;
            $this->command->info("Menyiapkan skenario AHP untuk Tenant: {$tenant->name} ({$tenantId})");

            // Bersihkan data lama khusus untuk tenant ini agar tidak bentrok
            SupplierEvaluation::where('tenant_id', $tenantId)->delete();
            CriterionComparison::where('tenant_id', $tenantId)->delete();
            Supplier::where('tenant_id', $tenantId)->delete();
            Criterion::where('tenant_id', $tenantId)->delete();

            // 1. Buat 3 Kriteria (Harga, Kualitas, Pengiriman)
            $kriteria = [
                'harga' => Criterion::create(['id' => Str::uuid(), 'tenant_id' => $tenantId, 'code' => 'C1', 'name' => 'Harga', 'type' => 'cost']),
                'kualitas' => Criterion::create(['id' => Str::uuid(), 'tenant_id' => $tenantId, 'code' => 'C2', 'name' => 'Kualitas', 'type' => 'benefit']),
                'pengiriman' => Criterion::create(['id' => Str::uuid(), 'tenant_id' => $tenantId, 'code' => 'C3', 'name' => 'Waktu Pengiriman', 'type' => 'cost']),
            ];

            // 2. Buat Matriks Perbandingan (Skala 1-9)
            $comparisons = [
                ['criterion_id_1' => $kriteria['harga']->id, 'criterion_id_2' => $kriteria['kualitas']->id, 'value' => 3],
                ['criterion_id_1' => $kriteria['harga']->id, 'criterion_id_2' => $kriteria['pengiriman']->id, 'value' => 5],
                ['criterion_id_1' => $kriteria['kualitas']->id, 'criterion_id_2' => $kriteria['pengiriman']->id, 'value' => 2],
            ];

            foreach ($comparisons as $comp) {
                CriterionComparison::create(array_merge($comp, ['id' => Str::uuid(), 'tenant_id' => $tenantId]));
            }

            // 3. Buat 3 Supplier Alternatif
            $suppliers = [
                'A' => Supplier::create(['id' => Str::uuid(), 'tenant_id' => $tenantId, 'name' => 'PT Alfa Makmur', 'contact_person' => 'Andi', 'phone' => '0812-1111-2222', 'address' => 'Jl. Industri No. 12']),
                'B' => Supplier::create(['id' => Str::uuid(), 'tenant_id' => $tenantId, 'name' => 'CV Beta Logistik', 'contact_person' => 'Budi', 'phone' => '0812-3333-4444', 'address' => 'Jl. Logistik No. 45']),
                'C' => Supplier::create(['id' => Str::uuid(), 'tenant_id' => $tenantId, 'name' => 'UD Gamma Grosir', 'contact_person' => 'Citra', 'phone' => '0812-5555-6666', 'address' => 'Jl. Grosir No. 88']),
            ];

            // 4. Input Nilai Mentah Evaluasi
            $evaluations = [
                // Supplier A
                ['supplier_id' => $suppliers['A']->id, 'criterion_id' => $kriteria['harga']->id, 'raw_value' => 15000],
                ['supplier_id' => $suppliers['A']->id, 'criterion_id' => $kriteria['kualitas']->id, 'raw_value' => 70],
                ['supplier_id' => $suppliers['A']->id, 'criterion_id' => $kriteria['pengiriman']->id, 'raw_value' => 4],

                // Supplier B
                ['supplier_id' => $suppliers['B']->id, 'criterion_id' => $kriteria['harga']->id, 'raw_value' => 25000],
                ['supplier_id' => $suppliers['B']->id, 'criterion_id' => $kriteria['kualitas']->id, 'raw_value' => 95],
                ['supplier_id' => $suppliers['B']->id, 'criterion_id' => $kriteria['pengiriman']->id, 'raw_value' => 1],

                // Supplier C
                ['supplier_id' => $suppliers['C']->id, 'criterion_id' => $kriteria['harga']->id, 'raw_value' => 9000],
                ['supplier_id' => $suppliers['C']->id, 'criterion_id' => $kriteria['kualitas']->id, 'raw_value' => 50],
                ['supplier_id' => $suppliers['C']->id, 'criterion_id' => $kriteria['pengiriman']->id, 'raw_value' => 2],
            ];

            foreach ($evaluations as $eval) {
                SupplierEvaluation::create(array_merge($eval, ['id' => Str::uuid(), 'tenant_id' => $tenantId]));
            }
        }

        $this->command->info("✅ Seeder AHP untuk seluruh tenant berhasil dijalankan!");
    }
}
