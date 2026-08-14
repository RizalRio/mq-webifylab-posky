# 🚀 POSKY Backend Service (Laravel 11 REST API)

Backend Service untuk **POSKY (Hybrid SaaS POS System)** — Sistem Point of Sale (POS) Omnichannel yang mendukung transaksi **Barang, Jasa, dan Persewaan (Rentals)** dalam satu faktur transaksi kasir, dilengkapi dengan **Analitik RFM, Cohort Analysis, dan Otorisasi Role Multi-Tenant**.

---

## 🛠️ Teknologi & Arsitektur Backend

- **Framework**: Laravel 11 (PHP 8.2+)
- **Database**: PostgreSQL dengan Optimasi Composite Indexes & CTE (*Common Table Expressions*)
- **Autentikasi**: Laravel Sanctum (Bearer Token & Cookie Session)
- **Asinkron & Queue**: Redis Server & Laravel Queues
- **Keamanan**: Pessimistic Locking (`lockForUpdate()`), Brute-force Rate Limiting, & Tenant Isolation Guard

---

## ⚙️ Fitur Utama API

1. **Universal Transaction Engine (`TransactionController`)**:
   - Polimorfik checkout untuk Barang, Jasa, dan Persewaan.
   - Pengurangan stok otomatis, pembuatan jadwal teknisi jasa, dan reservasi unit sewa.
   - Endpoint khusus pengembalian sewa (`POST /transactions/{id}/return`) dengan perhitungan denda terlambat otomatis.
2. **Analitik & Dashboard (`AnalyticsController`)**:
   - `GET /analytics/dashboard`: Omzet harian, transaksi, pelanggan aktif, dan tren penjualan 30 hari.
   - `GET /analytics/rfm`: Perhitungan skor Recency, Frequency, & Monetary pelanggan.
   - `GET /analytics/cohort`: Matriks retensi transaksi pelanggan menggunakan PostgreSQL CTE.
3. **Autentikasi & Profile (`AuthController`)**:
   - `POST /auth/login`: Autentikasi user & penerbitan token Sanctum.
   - `GET /auth/me`: Hidrasi data profil user & identitas tenant toko.
   - `POST /auth/logout`: Revokasi token Sanctum.
4. **Pengaturan Toko & POS (`SettingController`)**:
   - `GET /settings` & `PUT /settings`: Konfigurasi nama toko, alamat, persentase PPN %, dan footer struk thermal.

---

## 🚀 Panduan Setup & Instalasi Backend

### 1. Prasyarat System
- PHP >= 8.2 dengan ekstensi `pdo_pgsql`, `redis`, `mbstring`, `bcmath`.
- PostgreSQL Database Server.
- Composer.

### 2. Langkah Setup

```bash
# 进入 folder backend
cd backend

# Install dependensi PHP
composer install

# Salin file environment
cp .env.example .env

# Generate Application Key
php artisan key:generate

# Konfigurasi koneksi PostgreSQL pada .env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=posky_db
DB_USERNAME=postgres
DB_PASSWORD=your_password

# Jalankan migrasi database & seeder
php artisan migrate --seed

# Jalankan server lokal (Gunakan --no-reload untuk stabilitas worker)
php artisan serve --no-reload
```

Server backend REST API akan berjalan di `http://localhost:8000`.

---

## 📄 Ringkasan Endpoint Utama API

| Method | Endpoint | Deskripsi | Access |
|--------|----------|-----------|--------|
| `POST` | `/api/auth/login` | Login user & dapatkan token | Public |
| `GET` | `/api/auth/me` | Dapatkan profil user & tenant | Auth |
| `POST` | `/api/auth/logout` | Revokasi session token | Auth |
| `GET` | `/api/analytics/dashboard` | Summary metrik dashboard 30 hari | Auth |
| `GET` | `/api/analytics/rfm` | Data segmen & skor RFM pelanggan | Auth |
| `GET` | `/api/analytics/cohort` | Matriks retensi Cohort Analysis | Auth |
| `GET` | `/api/transactions` | Daftar faktur riwayat transaksi | Auth |
| `POST` | `/api/transactions` | Checkout faktur universal POS | Auth |
| `POST` | `/api/transactions/{id}/return` | Pengembalian sewa & kalkulasi denda | Auth |
| `GET` | `/api/products` | Katalog barang & produk fisik | Auth |
| `GET` | `/api/services` | Katalog layanan jasa teknisi | Auth |
| `GET` | `/api/rental-items` | Katalog item sewa & unit aset | Auth |
| `GET` | `/api/settings` | Konfigurasi profil toko & PPN | Auth |
| `PUT` | `/api/settings` | Update profil toko & footer struk | Auth |

---

## 📝 Lisensi
Hak Cipta © 2026 POSKY Omnichannel SaaS System.
