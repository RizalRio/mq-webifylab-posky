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
        Schema::create('criteria', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('code')->unique(); // Misal: C1, C2, C3
            $table->string('name'); // Misal: Harga, Kualitas, Pengiriman
            $table->enum('type', ['benefit', 'cost']); // Benefit (Makin besar makin baik), Cost (Makin kecil makin baik)
            $table->decimal('weight', 8, 4)->default(0); // Bobot kriteria hasil hitungan AHP
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('criteria');
    }
};
