<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('supplier_evaluations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained()->cascadeOnDelete();

            // Relasi ke Supplier (Alternatif)
            $table->foreignUuid('supplier_id')->constrained()->cascadeOnDelete();

            // Relasi ke Kriteria
            $table->foreignUuid('criterion_id')->constrained('criteria')->cascadeOnDelete();

            // Nilai mentah dari supplier untuk kriteria tersebut
            $table->decimal('raw_value', 15, 4);

            $table->timestamps();

            // Satu supplier hanya boleh memiliki satu nilai untuk satu kriteria tertentu
            $table->unique(['tenant_id', 'supplier_id', 'criterion_id'], 'unique_tenant_evaluation');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('supplier_evaluations');
    }
};
