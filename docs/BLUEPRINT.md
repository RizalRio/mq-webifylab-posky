# Project Blueprint

# WebifyLab Posky — Project Blueprint

> Sistem kasir SaaS multi-tenant berbasis AI untuk UMKM dengan dukungan 3 mode bisnis (Barang, Jasa, Persewaan), prediksi stok cerdas, dan rekomendasi supplier objektif.
> 

## 1. 🎯 Problem Statement

- **Masalah:** UMKM dengan model bisnis hybrid (misal: bengkel yang jual sparepart, servis, dan sewa alat) terpaksa menggunakan 2-3 aplikasi berbeda. Selain itu, mereka kesulitan memprediksi kapan stok habis dan memilih supplier secara objektif, mengandalkan intuisi yang rentan error.
- **Target User:** Pemilik UMKM (retail, bengkel, rental alat), manajer operasional, dan admin gudang.
- **Why Existing Solutions Fail:** Solusi POS yang ada di pasar (seperti Moka atau Kasir Pintar) umumnya kaku dan sangat terfokus pada model "Barang/Retail". Fitur analitik canggih (seperti forecasting atau supplier scoring) biasanya hanya tersedia di paket Enterprise yang mahal, tidak terjangkau untuk UMKM.

## 2. 💡 Solution Overview

WebifyLab Posky adalah platform SaaS multi-tenant yang menyatukan manajemen operasional 3 mode bisnis (Barang, Jasa, Persewaan) dalam satu dashboard terpadu. Sistem ini diperkuat oleh *microservice* analitik berbasis Python yang menjalankan algoritma **Prophet** untuk prediksi *stockout* dan **AHP (Analytic Hierarchy Process)** untuk *scoring* supplier, memberikan kemampuan *decision-making* setara enterprise dengan biaya operasional yang efisien.

### Key Features

- [ ]  Multi-tenant POS dengan 3 mode: Barang (inventory), Jasa (booking/teknisi), Persewaan (deposit & denda keterlambatan).
- [ ]  AHP-based supplier recommendation engine untuk mode Barang & Persewaan.
- [ ]  Stockout prediction dashboard menggunakan algoritma Prophet.
- [ ]  Universal Analytics Dashboard: RFM (Recency, Frequency, Monetary) & Cohort Analysis.

### Success Metrics

- [ ]  **< 300ms** API response time untuk transaksi inti (POS checkout).
- [ ]  **> 85% akurasi** prediksi stockout (diukur dengan MAPE - Mean Absolute Percentage Error).
- [ ]  **100% isolasi data** antar tenant (tidak ada kebocoran data lintas penyewa SaaS).

## 3. 🏗️ System Architecture

*(Bayangkan diagram Excalidraw/Draw.io di sini: Client (Next.js) <-> API (Laravel) <-> [PostgreSQL + Redis]. Laravel <-> Redis Queue <-> Python Worker (AHP/Prophet) <-> PostgreSQL)*

### Komponen Utama

- **Frontend:** **Next.js** — React, App Router, SSR/SSG untuk SEO & performa, Tailwind CSS, dan *Developer Experience* (DX) yang produktif.
- **Backend:** **PHP (Laravel 13)** — Ekosistem matang, dukungan *multi-tenancy* yang robust (misal: via `stancl/tenancy`), dan kecepatan development yang optimal.
- **Database:** **PostgreSQL + Redis** — PostgreSQL untuk integritas relasional dan fitur JSONB; Redis untuk caching, session, dan *message broker* (queue) antar Laravel dan Python.
- **AI/ML:** **Python (Pandas, dbt, Prophet, Custom AHP)** — Ekosistem *data science* terbaik, fleksibel, dan mudah diintegrasikan dengan backend PHP via asynchronous queue.

### Data Flow

1. User melakukan transaksi di Frontend (Next.js) -> request ke Backend (Laravel).
2. Laravel memvalidasi `tenant_id`, memproses transaksi, dan menyimpannya ke PostgreSQL.
3. Untuk analitik: Laravel menerbitkan *event* ke Redis Queue.
4. Python Worker mengambil job dari Redis, memproses data historis (AHP scoring / Prophet forecasting), lalu menyimpan hasilnya ke tabel khusus di PostgreSQL.
5. Frontend mengambil hasil prediksi/rekomendasi dari API Laravel untuk ditampilkan di Dashboard.

## 4. 🛠️ Tech Stack & Justification

| Layer | Tech | Alasan Pilih | Alternatif yang Dipertimbangkan |
| --- | --- | --- | --- |
| **Backend** | PHP (Laravel 13) | Fitur multi-tenancy matang, ekosistem kaya, development cepat. | Node.js (kurang matang di relational multi-tenancy), Golang (overkill untuk timeline 8 minggu). |
| **Frontend** | Next.js + Tailwind CSS | App Router, SSR/SSG, performa tinggi, ekosistem React terbesar, TypeScript-first, komponen reusable (Shadcn UI). | Vue/Nuxt 3 (ekosistem React jauh lebih luas dengan library UI yang kaya). |
| **AI/Data** | Python (Prophet, Pandas, AHP) | Library time-series terbaik, fleksibilitas logika AHP kustom. | R (kurang mudah integrasi web), JS-only ML (kurang robust untuk data analitik). |
| **Database** | PostgreSQL + Redis | ACID compliance, JSONB support, Redis untuk queue/caching. | MySQL (fitur analitik/window function kurang), MongoDB (kurang cocok untuk transaksi relasional ketat). |

## 5. 🗄️ Database Schema

*(Bayangkan ERD: `tenants` 1:N `users`, 1:N `products`/`services`/`rentals`, 1:N `transactions`. `suppliers` terhubung ke `products` dan `supplier_scores`)*

### Tabel Utama

- `tenants` — Data penyewa SaaS (subdomain, plan, status, database schema/name jika menggunakan multi-database isolation).
- `users` — Pengguna dalam tenant (id, tenant_id, role: admin/kasir/manajer).
- `business_entities` — Polymorphic atau tabel terpisah untuk `products`, `services`, `rentals` (dengan `tenant_id`).
- `transactions` & `transaction_items` — Riwayat penjualan/booking/sewa (dengan `tenant_id`, `type` enum).
- `suppliers` & `supplier_scores` — Data supplier dan hasil perhitungan bobot AHP.
- `inventory_forecasts` — Hasil prediksi Prophet (tenant_id, product_id, forecast_date, predicted_demand, lower_bound, upper_bound).

### Indexing Strategy

- Composite index pada `(tenant_id, id)` untuk **semua** tabel utama (wajib untuk multi-tenancy).
- Index pada `transaction_date` dan `tenant_id` untuk mempercepat query analitik RFM/Cohort.
- Index pada `(tenant_id, product_id, forecast_date)` di tabel `inventory_forecasts`.

## 6. 🧠 AI/Algorithm Design

### A. AHP (Analytic Hierarchy Process) untuk Supplier

- **Input:** Kriteria supplier (Harga, Kualitas, Lead Time, Rating) dan matriks perbandingan berpasangan (*pairwise comparison*) dari user (atau bobot default industri).
- **Output:** Skor prioritas normalisasi (0-1) dan peringkat supplier untuk setiap kategori barang.
- **Trade-off:** Kelemahan utama adalah subjektivitas bobot awal. **Mitigasi:** Sediakan template bobot default berbasis studi kasus industri (misal: bengkel memprioritaskan Lead Time, retail memprioritaskan Harga).

### B. Prophet untuk Stockout Prediction

- **Input:** Data historis penjualan per produk (`ds`: tanggal, `y`: jumlah terjual) minimal 3-6 bulan.
- **Output:** Forecast jumlah kebutuhan stok untuk N hari ke depan beserta interval kepercayaan (*uncertainty intervals*).
- **Trade-off:** Asumsi tren musiman bisa kurang akurat jika ada anomali mendadak (misal: viral). **Mitigasi:** Jadwalkan *retrain* model mingguan dan berikan flag "low confidence" jika varians data terlalu tinggi.

## 7. 📅 Milestone & Timeline

| Week | Milestone | Definition of Done |
| --- | --- | --- |
| **1-2** | Multi-tenant Laravel setup + multi-mode architecture | DB schema final, isolasi tenant teruji (misal: pakai `stancl/tenancy`), basic API auth & CRUD siap. |
| **3-4** | Core POS dengan 3 mode (Next.js Frontend) | UI kasir fungsional, CRUD Barang/Jasa/Persewaan lengkap, transaksi tercatat dengan benar per tenant. |
| **5-6** | AHP supplier engine (Python) | Script Python terintegrasi via Redis Queue, scoring supplier berjalan, hasil tersimpan & tampil di UI. |
| **7-8** | Forecasting & analytics dashboard | Model Prophet berjalan, dashboard RFM & cohort tampil, load testing selesai, deploy ke production (VPS/Cloud). |

## 8. ⚠️ Risks & Mitigation

| Risiko | Kemungkinan | Dampak | Mitigasi |
| --- | --- | --- | --- |
| **Scope creep** (fitur bertambah terus) | Tinggi | Tinggi | Time-box ketat per fitur. Gunakan daftar "Out of Scope" sebagai tameng. |
| **Data historis tidak cukup** untuk AI | Sedang | Tinggi | Buat *synthetic data generator* (Python script) untuk mengisi data dummy yang realistis demi validasi model. |
| **Kompleksitas Multi-tenancy** | Tinggi | Tinggi | Jangan bangun dari nol. Gunakan package proven seperti `stancl/tenancy` di Laravel. |
| **Performa Python worker lambat** | Rendah | Sedang | Gunakan Redis queue agar request user tidak terblokir (*asynchronous processing*). |

## 9. 🚫 Out of Scope (PENTING!)

- **Native Mobile App (iOS/Android)** -> Fokus pada Responsive Web App (PWA) agar timeline 8 minggu tercapai.
- **Integrasi Payment Gateway Real-time (Midtrans/Xendit)** -> Gunakan simulasi/mock payment ("Bayar Tunai" / "Transfer Manual") untuk fokus pada logic bisnis inti dan multi-mode.
- **Real-time IoT GPS Tracking** untuk barang persewaan -> Terlalu kompleks dan di luar kapabilitas SaaS manajemen murni.

## 10. 📚 References

- [Laravel Multi-Tenancy Documentation (stancl/tenancy)](https://tenancyforlaravel.com/)
- [Facebook Prophet: Time Series Forecasting in Python](https://facebook.github.io/prophet/)
- [Analytic Hierarchy Process (AHP) Methodology - T.L. Saaty](https://en.wikipedia.org/wiki/Analytic_hierarchy_process)
- [dbt (data build tool) for Analytics Engineering](https://docs.getdbt.com/)