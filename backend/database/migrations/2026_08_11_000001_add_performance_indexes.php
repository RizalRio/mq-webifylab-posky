<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migrasi Indeks Database untuk Optimasi Performa Query.
 * 
 * Menambahkan indeks komposit dan tunggal pada kolom-kolom
 * yang paling sering difilter (tenant_id, type, status, dll)
 * untuk mempercepat query SELECT secara signifikan.
 */
return new class extends Migration
{
    public function up(): void
    {
        // --- Indeks Tabel Transactions ---
        Schema::table('transactions', function (Blueprint $table) {
            $table->index('tenant_id', 'idx_transactions_tenant');
            $table->index('customer_id', 'idx_transactions_customer');
            $table->index('type', 'idx_transactions_type');
            $table->index('payment_method', 'idx_transactions_payment');
            $table->index('created_at', 'idx_transactions_created');
            $table->index(['tenant_id', 'type'], 'idx_transactions_tenant_type');
            $table->index(['tenant_id', 'created_at'], 'idx_transactions_tenant_created');
        });

        // --- Indeks Tabel Transaction Items ---
        Schema::table('transaction_items', function (Blueprint $table) {
            $table->index('transaction_id', 'idx_txitems_transaction');
            $table->index(['itemable_type', 'itemable_id'], 'idx_txitems_itemable');
        });

        // --- Indeks Tabel Products ---
        Schema::table('products', function (Blueprint $table) {
            $table->index('tenant_id', 'idx_products_tenant');
            $table->index('category', 'idx_products_category');
            $table->index(['tenant_id', 'sku'], 'idx_products_tenant_sku');
        });

        // --- Indeks Tabel Services ---
        Schema::table('services', function (Blueprint $table) {
            $table->index('tenant_id', 'idx_services_tenant');
        });

        // --- Indeks Tabel Rental Items ---
        Schema::table('rental_items', function (Blueprint $table) {
            $table->index('tenant_id', 'idx_rentalitems_tenant');
            $table->index('status', 'idx_rentalitems_status');
        });

        // --- Indeks Tabel Customers ---
        Schema::table('customers', function (Blueprint $table) {
            $table->index('tenant_id', 'idx_customers_tenant');
            $table->index('rfm_segment', 'idx_customers_rfm');
        });

        // --- Indeks Tabel Stock Logs ---
        Schema::table('stock_logs', function (Blueprint $table) {
            $table->index('product_id', 'idx_stocklogs_product');
            $table->index('type', 'idx_stocklogs_type');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex('idx_transactions_tenant');
            $table->dropIndex('idx_transactions_customer');
            $table->dropIndex('idx_transactions_type');
            $table->dropIndex('idx_transactions_payment');
            $table->dropIndex('idx_transactions_created');
            $table->dropIndex('idx_transactions_tenant_type');
            $table->dropIndex('idx_transactions_tenant_created');
        });

        Schema::table('transaction_items', function (Blueprint $table) {
            $table->dropIndex('idx_txitems_transaction');
            $table->dropIndex('idx_txitems_itemable');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('idx_products_tenant');
            $table->dropIndex('idx_products_category');
            $table->dropIndex('idx_products_tenant_sku');
        });

        Schema::table('services', function (Blueprint $table) {
            $table->dropIndex('idx_services_tenant');
        });

        Schema::table('rental_items', function (Blueprint $table) {
            $table->dropIndex('idx_rentalitems_tenant');
            $table->dropIndex('idx_rentalitems_status');
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->dropIndex('idx_customers_tenant');
            $table->dropIndex('idx_customers_rfm');
        });

        Schema::table('stock_logs', function (Blueprint $table) {
            $table->dropIndex('idx_stocklogs_product');
            $table->dropIndex('idx_stocklogs_type');
        });
    }
};
