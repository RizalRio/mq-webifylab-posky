<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            // Nilai mentah dari transaksi
            $table->timestamp('last_transaction_at')->nullable()->after('address'); // Untuk Recency
            $table->integer('total_transactions')->default(0)->after('last_transaction_at'); // Untuk Frequency
            $table->decimal('total_spent', 15, 2)->default(0)->after('total_transactions'); // Untuk Monetary

            // Skor RFM (skala 1-5, di mana 5 adalah yang terbaik)
            $table->integer('r_score')->nullable()->after('total_spent');
            $table->integer('f_score')->nullable()->after('r_score');
            $table->integer('m_score')->nullable()->after('f_score');

            // Label Segmentasi (Contoh: 'Champions', 'Loyal', 'At Risk', dll)
            $table->string('rfm_segment')->nullable()->after('m_score');
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn([
                'last_transaction_at',
                'total_transactions',
                'total_spent',
                'r_score',
                'f_score',
                'm_score',
                'rfm_segment'
            ]);
        });
    }
};
