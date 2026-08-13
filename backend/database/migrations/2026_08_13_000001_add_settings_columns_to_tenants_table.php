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
        Schema::table('tenants', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('business_type');
            $table->text('address')->nullable()->after('phone');
            $table->decimal('tax_percentage', 5, 2)->default(11.00)->after('address');
            $table->text('receipt_footer')->nullable()->after('tax_percentage');
            $table->decimal('default_discount', 12, 2)->default(0.00)->after('receipt_footer');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn(['phone', 'address', 'tax_percentage', 'receipt_footer', 'default_discount']);
        });
    }
};
