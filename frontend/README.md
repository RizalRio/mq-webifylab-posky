# 💻 POSKY Frontend Web Application (Next.js 16 App Router)

Aplikasi Web Frontend Dashboard & Kasir POS untuk **POSKY (Hybrid SaaS POS System)** — Dibangun dengan desain modern, cepat, dan reaktif menggunakan **Next.js 16, React 19, TypeScript, Tailwind CSS, TanStack React Query, dan Recharts**.

---

## 🎨 Modul & Fitur Utama Antarmuka

1. **Dashboard Utama (`/`)**:
   - Ringkasan metrik realtime (Total Pendapatan, Transaksi, Pelanggan Aktif, Peringatan Stok).
   - Grafik tren penjualan 30 hari terakhir (Recharts) dengan pemformatan Rupiah (`IDR`).
2. **Modul Kasir POS (`/pos`)**:
   - Pemilihan item barang, jasa, dan persewaan dalam satu keranjang universal.
   - Perhitungan otomatis PPN % dinamis (sesuai setting toko) dan diskon.
   - Form tanggal sewa & jadwal teknisi jasa.
   - **Pratinjau Struk Kasir Thermal (58mm / 80mm)** dengan isolasi `@media print`.
3. **Riwayat Transaksi & Pengembalian (`/transaksi`)**:
   - Tabel laporan transaksi faktur dengan filter pencarian dan tipe pembayaran.
   - Modal Pengembalian Sewa dengan kalkulasi denda otomatis.
   - Tombol cetak cepat struk thermal per baris transaksi.
4. **Analitik Pelanggan Lanjutan (`/pelanggan/analitik`)**:
   - Grafik Bar Chart Distribusi Segmen RFM (*Champions*, *Loyal*, *At Risk*, *Hibernating*).
   - Matriks *Heatmap* **Cohort Analysis** retensi pelanggan per kohort bulan.
   - Leaderboard Top Pelanggan berdasarkan skor RFM.
5. **Pengaturan Toko & POS (`/pengaturan`)**:
   - Form identitas toko, nomor telepon, alamat lengkap, PPN %, diskon default, dan ucapan footer struk thermal.
6. **Autentikasi & Otorisasi RBAC (`/login`)**:
   - Form Login terintegrasi Sanctum Token & Cookie.
   - Tombol pintas 1-Click Demo Login untuk **Admin** dan **Kasir**.
   - Penapis (*filter*) menu navigasi otomatis sesuai peran user (`ADMIN` vs `KASIR`).

---

## 🛠️ Teknologi & Stack Frontend

- **Framework**: Next.js 16.3 (Turbopack, App Router)
- **UI & Icon**: Tailwind CSS, Lucide Icons, Shadcn UI Components
- **State & Query**: TanStack React Query v5, Zustand (Auth & Cart Store)
- **Data Visualization**: Recharts
- **HTTP Client**: Axios dengan Interceptor Auth & Auto-logout 401
- **Notification**: Sonner Toast

---

## 🚀 Panduan Setup & Jalankan Frontend

### 1. Prasyarat System
- Node.js >= 18.x
- npm atau yarn

### 2. Langkah Instalasi

```bash
# 进入 folder frontend
cd frontend

# Install dependensi npm
npm install

# Buat file konfigurasi .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Jalankan server pengembangan lokal (Dev Mode)
npm run dev
```

Aplikasi frontend akan berjalan di `http://localhost:3000`.

### 3. Build Produksi

```bash
# Jalankan kompilasi TypeScript & build Next.js
npm run build

# Jalankan server hasil build
npm run start
```

---

## 📝 Struktur Folder Utama Frontend

```text
frontend/
├── app/                  # Next.js App Router (page, layout, route)
│   ├── (auth)/login/     # Halaman Login
│   ├── pelanggan/        # Daftar Pelanggan & Analitik RFM/Cohort
│   ├── pos/              # Kasir Checkout POS
│   ├── stok/             # Riwayat & Mutasi Stok
│   ├── transaksi/        # Riwayat Faktur Transaksi
│   └── pengaturan/       # Pengaturan Profil Toko & PPN
├── components/           # Reusable UI & Modal Components
│   ├── dashboard/        # ProphetChart & Metrics
│   ├── layout/           # Sidebar, Topbar, AppShell
│   ├── pelanggan/        # RfmDistributionChart, CohortHeatmap
│   ├── pos/              # CheckoutModal
│   └── transaksi/        # ReceiptPrintModal, ReturnRentalModal
├── hooks/                # Custom React Hooks (useDebounce, dsb)
├── lib/                  # API Clients & Axios Configuration
├── store/                # Zustand Global State (useAuthStore, useCartStore)
└── types/                # TypeScript Interfaces & Models
```

---

## 📄 Lisensi
Hak Cipta © 2026 POSKY Omnichannel SaaS System.
