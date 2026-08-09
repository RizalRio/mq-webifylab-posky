# System Architecture Document (SAD)

# WebifyLab Posky — System Architecture Document (SAD)

## 1. 🎯 Architectural Goals & Constraints

- **Multi-Tenant Isolation:** Data antar UMKM (tenant) harus terisolasi secara logis dengan ketat untuk mencegah kebocoran data.
- **Non-Blocking AI Processing:** Komputasi AI (Prophet/AHP) tidak boleh memblokir atau memperlambat respons transaksi POS utama.
- **Cost-Effective Scalability:** Arsitektur harus efisien untuk dijalankan di VPS standar (misal: 2 vCPU, 4GB RAM) namun tetap bisa di-*scale* secara horizontal jika diperlukan.
- **Time-to-Market:** Desain harus pragmatis untuk diselesaikan dalam timeline 8 minggu (menghindari *over-engineering*).

## 2. 🏗️ High-Level Architecture (Container Level)

Diagram berikut menggambarkan interaksi antar komponen utama sistem.

```mermaid
graph TD
    subgraph Client Layer
        A[Web Browser / Mobile PWA]
    end

    subgraph Frontend Layer
        B[Next.js App<br/>App Router, React, TailwindCSS, Zustand]
    end

    subgraph Backend Layer (Laravel 13)
        C[API Gateway / Controllers]
        D[Business Logic & Global Scopes<br/>(Multi-tenant Isolation)]
        E[Event Dispatcher]
    end

    subgraph Data & Message Broker Layer
        F[(PostgreSQL<br/>Shared Schema + tenant_id)]
        G[(Redis<br/>Cache, Session, Queue)]
    end

    subgraph AI / Data Processing Layer
        H[Python Worker<br/>RQ/Celery, Pandas, Prophet, AHP]
        I[dbt Core<br/>Transformasi data untuk Dashboard]
    end

    A -->|HTTPS / REST API| B
    B -->|JSON API| C
    C <--> D
    D <-->|Read/Write| F
    D <-->|Cache/Session| G
    E -->|Publish Event| G
    H -->|Consume Queue| G
    H <-->|Read History / Write Prediction| F
    I -->|Transform| F
```

## 3. 🔒 Multi-Tenancy Strategy

Mengingat target pasar adalah UMKM dan batasan waktu 8 minggu, strategi **Single Database, Shared Schema** adalah yang paling optimal.

- **Mekanisme:** Setiap tabel utama memiliki kolom `tenant_id` (UUID atau Bigint).
- **Enforcement:** Menggunakan **Laravel Global Scopes** secara otomatis. Setiap query model akan otomatis menambahkan `WHERE tenant_id = current_tenant_id`. Ini mencegah *human error* (lupa menambahkan filter tenant).
- **Keamanan Tambahan:** Middleware `IdentifyTenant` yang membaca subdomain (misal: `toko-a.webifylab.com`) atau header JWT untuk mengidentifikasi `tenant_id` yang aktif.
- **Alternatif di Masa Depan:** Jika ada klien enterprise yang meminta isolasi fisik, arsitektur ini bisa di-upgrade ke *Schema-per-Tenant* (menggunakan fitur Schema PostgreSQL) dengan perubahan minimal di Laravel.

## 4. 🧩 Component Details

| Komponen | Teknologi | Tanggung Jawab Utama |
| --- | --- | --- |
| **Frontend** | Next.js, Tailwind CSS | Menangani UI, State Management (Zustand & TanStack Query), validasi form (React Hook Form + Zod), dan rendering dashboard. |
| **Backend API** | Laravel 13, PHP 8.3 | Autentikasi (Sanctum), validasi bisnis, manajemen transaksi, dan pemicu *event* antrian. |
| **Database** | PostgreSQL 15+ | Penyimpanan data relasional. Memanfaatkan fitur `JSONB` untuk menyimpan konfigurasi dinamis per tenant. |
| **Message Broker** | Redis | Menyimpan antrian pekerjaan (queue) untuk diproses oleh Python, serta caching query yang sering diakses. |
| **AI Worker** | Python 3.10+, RQ (Redis Queue) | Mendengarkan antrian Redis, menjalankan skrip Prophet/AHP, dan menyimpan hasil kembali ke PostgreSQL. |
| **Analytics** | dbt (data build tool) | Mengubah data mentah transaksi menjadi tabel siap saji untuk RFM & Cohort Analysis (opsional, bisa juga pakai query Laravel langsung untuk MVP). |

## 5. 🔄 Critical Data Flows

### Flow A: Transaksi POS Standar (Synchronous)

1. Kasir memindai barang/jasa di UI Next.js.
2. Next.js mengirim `POST /api/transactions` dengan payload dan token JWT.
3. Laravel Middleware memvalidasi token dan mengidentifikasi `tenant_id`.
4. Laravel memvalidasi stok (untuk mode Barang) atau ketersediaan (Jasa/Persewaan).
5. Laravel menyimpan transaksi ke PostgreSQL dalam satu *Database Transaction* (ACID).
6. Laravel mengembalikan respons `201 Created` ke Next.js dalam **< 200ms**.

### Flow B: AI Forecasting & AHP Scoring (Asynchronous)

1. Setiap kali transaksi terjadi, Laravel memicu *Event* `TransactionCompleted`.
2. *Listener* menerbitkan pesan ke Redis Queue (`forecasting_queue` atau `ahp_queue`) berisi `tenant_id` dan `product_id`.
3. **Python Worker** (yang berjalan di background) mengambil pesan dari Redis.
4. Python mengambil data historis 6 bulan terakhir dari PostgreSQL untuk `tenant_id` tersebut.
5. Python menjalankan model Prophet (untuk forecast) atau matriks AHP (untuk scoring).
6. Python menulis hasil prediksi/skor ke tabel `inventory_forecasts` atau `supplier_scores` di PostgreSQL.
7. *Catatan:* Proses ini sama sekali tidak membebani user yang sedang bertransaksi.

## 6. 🗄️ Database Schema Design (Core Tables)

```sql
-- Tabel Tenant (Penyewa SaaS)
CREATE TABLE tenants (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    business_type VARCHAR(50), -- 'barang', 'jasa', 'persewaan', 'hybrid'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Produk/Entitas Bisnis (Shared Schema)
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'barang', 'jasa', 'sewa'
    current_stock INT DEFAULT 0, -- Hanya relevan jika type = 'barang'
    rental_deposit DECIMAL(10,2) DEFAULT 0, -- Hanya relevan jika type = 'sewa'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Index Wajib: CREATE INDEX idx_products_tenant ON products(tenant_id);

-- Tabel Transaksi
CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    total_amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Index Wajib: CREATE INDEX idx_transactions_tenant_date ON transactions(tenant_id, created_at);
```

## 7. 🚀 Infrastructure & Deployment Strategy

Untuk memudahkan development dan deployment, seluruh stack akan dikontainerisasi menggunakan **Docker Compose**.

**Layanan dalam `docker-compose.yml`:**

1. `app`: Laravel PHP-FPM + Nginx.
2. `frontend`: Next.js (Node.js).
3. `db`: PostgreSQL 15.
4. `redis`: Redis 7 (untuk cache & queue).
5. `ai-worker`: Python container dengan dependencies (Pandas, Prophet, Redis-py).

**Deployment Target (Rekomendasi Portofolio):**

- VPS Murah (misal: DigitalOcean Droplet / IDCloudHost / Vultr) dengan Docker.
- Reverse Proxy: Nginx atau Caddy untuk menangani SSL (Let's Encrypt) dan routing subdomain (`.webifylab.com` ke container yang tepat).

## 8. ⚠️ Security & Compliance Considerations

- **Data Isolation:** Menerapkan `$tenantId` di setiap query melalui Laravel Global Scope. Tidak ada *raw query* yang bypass ini.
- **Authentication:** Laravel Sanctum untuk API token management. Password di-hash menggunakan Bcrypt.
- **Rate Limiting:** Menerapkan throttle pada API endpoint untuk mencegah abuse (misal: 60 request per menit per tenant).
- **Secrets Management:** Menggunakan `.env` yang tidak di-commit ke Git. Untuk production,