# 🚀 POSKY — Smart Multi-Mode POS & Analytics System

**POSKY** adalah Sistem Kasir (Point of Sale) dan Analitik Pintar terintegrasi yang dirancang khusus untuk bisnis berbasis **Hybrid (Barang, Jasa, & Persewaan)** dengan dukungan rekomendasi keputusan **AI (Prophet & AHP)** serta analisis segmen pelanggan **RFM**.

---

## 🌟 Fitur Utama

- 🛒 **Retail Mode (Barang):** Kelola inventori, stok menipis, varian harga, dan transaksi kasir cepat.
- 🛠️ **Service Mode (Jasa):** Jadwal reservasi layanan, penugasan teknisi, dan pelacakan status pengerjaan.
- 📦 **Rental Mode (Persewaan):** Manajemen aset sewa, durasi sewa, tanggal pengembalian, dan pemeriksaan kondisi barang.
- 🔮 **Prophet AI Sales Forecasting:** Prediksi tren pendapatan dan proyeksi stok 30 hari ke depan berbasis machine learning.
- 📊 **AHP Decision Support:** Rekomendasi pemilihan supplier terbaik berdasarkan perbandingan kriteria berbobot.
- 👥 **Analisis Pelanggan RFM:** Segmentasi loyalitas pelanggan (*Recency, Frequency, Monetary*) secara otomatis.
- 🌗 **Responsive & Modern UI:** Antarmuka SaaS B2B dengan dukungan **Dark Mode** dan desain data-dense tabular.

---

## 🏗️ Arsitektur & Teknologi

Struktur proyek terbagi ke dalam 3 komponen utama (*Monorepo Architecture*):

```text
mq-webifylab-posky/
├── frontend/        # Next.js 16 (App Router, TailwindCSS, TypeScript, Zustand, TanStack Query)
├── backend/         # Laravel 11 (REST API, Sanctum Auth, PostgreSQL, Multi-Tenant Architecture)
├── ai-worker/       # Python Service (Prophet Forecast & AHP Decision Engine)
└── docs/            # Dokumentasi Desain (DESIGN.md), Arsitektur & API
```

---

## 🛠️ Prasyarat Sistem

Sebelum menjalankan proyek, pastikan environment berikut telah terinstal:

- **PHP** >= 8.2 & **Composer**
- **Node.js** >= 18.0 & **NPM**
- **Python** >= 3.10 & **PIP**
- **PostgreSQL** >= 14

---

## 🚀 Panduan Memulai (*Quick Start*)

### 1. Persiapan Backend (Laravel 11)

```bash
cd backend

# 1. Instalasi dependensi PHP
composer install

# 2. Salin environment config
cp .env.example .env

# 3. Generate Application Key
php artisan key:generate

# 4. Atur kredensial DB PostgreSQL di file .env, kemudian jalankan migrasi & seeder:
php artisan migrate --seed

# 5. Jalankan server backend Laravel (berjalan di http://localhost:8000)
php artisan serve
```

### 2. Persiapan Frontend (Next.js 16)

```bash
cd ../frontend

# 1. Instalasi dependensi Node.js
npm install

# 2. Jalankan server dev Next.js (berjalan di http://localhost:3000)
npm run dev
```

### 3. Persiapan AI Worker (Python Prophet & AHP)

```bash
cd ../ai-worker

# 1. Buat virtual environment Python
python -m venv venv

# 2. Aktivasi Virtual Environment
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# 3. Instalasi dependensi Python
pip install -r requirements.txt

# 4. Jalankan AI Worker Engine
python worker.py
```

---

## 🔑 Kredensial Developer / Testing

Untuk pengetesan awal, database seeder menyediakan akun default berikut (Tenant: `POSKY Demo Store`):

| Role | Email | Password | Akses Utama |
| :--- | :--- | :--- | :--- |
| **Admin / Developer** | `admin@posky.com` | `password123` | Akses Penuh Sistem & Konfigurasi |
| **Kasir Utama** | `kasir@posky.com` | `password123` | Transaksi POS & Pelanggan |
| **Manajer Toko** | `manajer@posky.com` | `password123` | Dashboard Overview & Rekomendasi AHP |
| **Teknisi Servis** | `teknisi@posky.com` | `password123` | Status Pengerjaan Jasa & Inventori |

---

## 📄 Lisensi & Kontribusi

Dikembangkan untuk proyek **MQ-WebifyLab — POSKY**.  
Seluruh hak cipta dilindungi undang-undang.
