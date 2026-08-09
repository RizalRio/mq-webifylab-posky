<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_predictions', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Relasi ke arsitektur SaaS
            $table->foreignUuid('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('product_id')->constrained('products')->cascadeOnDelete();

            // Metrik Hasil Prediksi Prophet
            // Tanggal perkiraan stok akan habis (bisa null jika stok diprediksi sangat aman)
            $table->date('estimated_stockout_date')->nullable();

            // Batas aman persediaan (titik di mana sistem harus memberi peringatan Restock)
            $table->decimal('safety_stock_level', 10, 2)->default(0);

            // Tingkat keyakinan model AI (0 - 100%)
            $table->decimal('confidence_score', 5, 2)->nullable();

            // Penanda waktu kapan AI terakhir kali memperbarui baris ini
            $table->timestamp('last_calculated_at')->nullable();

            $table->timestamps();

            // Memastikan satu produk di satu toko hanya memiliki satu baris prediksi aktif
            $table->unique(['tenant_id', 'product_id'], 'unique_tenant_product_prediction');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_predictions');
    }
};
