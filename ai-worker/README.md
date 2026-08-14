# 🤖 POSKY AI Worker Service (Python ML Engine)

Layanan **AI & Analytics Worker** untuk **POSKY (Hybrid SaaS POS System)** — Engine Machine Learning asinkron yang berjalan dengan **Python, Celery, Redis, dan Facebook Prophet** untuk mengeksekusi perhitungan **AHP (Analytic Hierarchy Process)** dan **Peramalan Stok (Prophet Time-Series Forecasting)**.

---

## 🛠️ Arsitektur & Teknologi AI Worker

- **Language**: Python 3.10+
- **Message Broker & Queue**: Redis Server (Pub/Sub & Task Queue)
- **Task Worker**: Celery / Raw Worker (`worker.py`)
- **Algorithms & ML Stack**:
  - **Facebook Prophet** (`prophet_engine.py`): Peramalan tren penjualan deret waktu & perhitungan *Safety Stock*.
  - **AHP Engine** (`ahp_engine.py`): Matriks perbandingan berpasangan, *Consistency Ratio* (CR < 0.1), & perangkingan supplier objektif.
- **Database**: PostgreSQL Direct Connection (`psycopg2` / `sqlalchemy`).

---

## ⚙️ Komponen Engine AI

### 1. Engine AHP (`ahp_engine.py`)
- Menerima matriks evaluasi kriteria supplier dari Laravel.
- Menghitung nilai *Eigenvector*, *Principal Eigenvalue ($\lambda_{max}$)*, *Consistency Index (CI)*, dan *Consistency Ratio (CR)*.
- Jika $CR < 0.1$, hasil perangkingan supplier dianggap konsisten dan disimpan ke database PostgreSQL untuk dikonsumsi frontend.

### 2. Engine Prophet (`prophet_engine.py`)
- Mengabstraksi data transaksi historis toko dari PostgreSQL per hari.
- Melatih model deret waktu *Facebook Prophet* untuk memprediksi tren permintaan 30 hari ke depan.
- Menghitung **Safety Stock** dan perkiraan **Tanggal Kehabisan Stok (Out of Stock Date)**.

---

## 🚀 Panduan Jalankan AI Worker

### 1. Prasyarat System
- Python >= 3.10
- Redis Server berjalan di `localhost:6379`
- PostgreSQL Server berjalan di `localhost:5432`

### 2. Langkah Setup & Eksekusi

```bash
# 进入 folder ai-worker
cd ai-worker

# Buat Virtual Environment Python
python -m venv venv

# Aktifkan Virtual Environment
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install Dependensi Python
pip install -r requirements.txt

# Tes koneksi Database & Redis
python test_db.py

# Jalankan Worker Listener
python worker.py
```

Worker akan mendengarkan antrean tugas (*job queue*) yang dikirimkan oleh backend Laravel via Redis.

---

## 📝 Konfigurasi Environment (`config.py`)

Koneksi database dan Redis dapat dikonfigurasi melalui file `config.py` atau variabel environment:

```python
REDIS_HOST = "localhost"
REDIS_PORT = 6379

DB_HOST = "localhost"
DB_PORT = 5432
DB_NAME = "posky_db"
DB_USER = "postgres"
DB_PASSWORD = "your_password"
```

---

## 📝 Lisensi
Hak Cipta © 2026 POSKY Omnichannel SaaS System.
