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
        Schema::create('criterion_comparisons', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained()->cascadeOnDelete();

            // Kriteria pertama yang dibandingkan
            $table->foreignUuid('criterion_id_1')->constrained('criteria')->cascadeOnDelete();

            // Kriteria kedua sebagai pembanding
            $table->foreignUuid('criterion_id_2')->constrained('criteria')->cascadeOnDelete();

            // Nilai perbandingan (Skala 1-9)
            // Contoh: Jika nilai = 3, berarti criterion 1 sedikit lebih penting dari criterion 2
            $table->decimal('value', 8, 4);

            $table->timestamps();

            // Mencegah duplikasi perbandingan yang sama di satu tenant
            $table->unique(['tenant_id', 'criterion_id_1', 'criterion_id_2'], 'unique_tenant_comparison');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('criterion_comparisons');
    }
};
