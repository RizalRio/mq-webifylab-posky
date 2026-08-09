# ADR 0003: Polymorphic Relation for Transaction Items

## Status
Accepted

## Context
WebifyLab Posky mendukung 3 mode bisnis dalam satu sistem:
- **Barang:** Transaksi penjualan produk fisik (ada stok, SKU, harga)
- **Jasa:** Transaksi booking service (ada durasi, teknisi, jadwal)
- **Persewaan:** Transaksi rental item (ada deposit, periode sewa, denda)

Ada 2 pendekatan database design:
1. **Separate Tables:** Buat 3 tabel terpisah: `transaction_products`, `transaction_services`, `transaction_rentals`.
2. **Polymorphic Relation:** Satu tabel `transaction_items` dengan kolom `itemable_type` dan `itemable_id`.

Mengingat ketiga mode ini memiliki logika bisnis yang sangat berbeda (stok vs jadwal vs deposit), kita perlu memilih struktur yang fleksibel namun tetap maintainable.

## Decision
Kita memilih **Opsi 2: Polymorphic Relation** dengan struktur:
```php
// transaction_items table
- id
- transaction_id
- itemable_type  // 'App\Models\Product', 'App\Models\Service', 'App\Models\RentalItem'
- itemable_id    // UUID dari Product/Service/RentalItem
- quantity
- unit_price
- subtotal
```

Lalu tabel spesifik (opsional) untuk logika tambahan:
- `rental_bookings` (untuk rental period & late fee)
- `service_schedules` (untuk teknisi assignment)

## Consequences

**Positif (+):**
- **Flexibility:** Mudah tambah mode bisnis baru (misal: "Langganan") tanpa ubah struktur transaksi.
- **Simplicity:** Satu tabel untuk semua jenis item, query lebih sederhana.
- **Reporting:** Laporan penjualan bisa query satu tabel, tidak perlu UNION 3 tabel.
- **Laravel Support:** Eloquent punya native support untuk polymorphic relations (`morphTo`, `morphMany`).

**Negatif (-):**
- **No Foreign Key Constraint:** Database tidak bisa enforce referential integrity (karena `itemable_id` bisa merujuk ke 3 tabel berbeda).
- **Query Performance:** JOIN dengan tabel spesifik butuh filter `itemable_type` dulu.
- **Complexity:** Developer harus aware bahwa `itemable_id` bisa merujuk ke entitas berbeda.

**Mitigasi:**
- Enforce data integrity di level aplikasi (Laravel Model events).
- Selalu index composite `(itemable_type, itemable_id)` untuk performa.
- Dokumentasi jelas di ERD dan code comments.
- Gunakan Laravel's `morphMap` untuk menghindari hardcode class name di database.