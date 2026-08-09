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
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('sku');
            $table->string('name');
            $table->string('category')->nullable();
            $table->integer('stock')->default(0);
            $table->integer('min_stock_threshold')->default(0);
            $table->decimal('cost_price', 12, 2);
            $table->decimal('sell_price', 12, 2);
            // supplier_id akan kita tambahkan nanti saat modul AI/Supplier dikerjakan
            $table->timestamps();
            $table->softDeletes();

            // Indexing untuk Tenant & Stock[cite: 4]
            $table->index(['tenant_id', 'stock']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
