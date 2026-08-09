# ADR 0002: AI Worker Separation (Python as Background Service)

## Status
Accepted

## Context
WebifyLab Posky membutuhkan 2 fitur AI/ML:
1. **Prophet** untuk forecasting stok (time-series prediction)
2. **AHP (Analytic Hierarchy Process)** untuk supplier scoring (multi-criteria decision making)

Ada 3 opsi implementasi:
1. **PHP-ML / MathPHP:** Jalankan semua di Laravel menggunakan library PHP.
2. **Direct Execution:** Laravel memanggil Python script via `shell_exec()` atau `Process`.
3. **Background Worker:** Python berjalan sebagai service terpisah, berkomunikasi via Redis Queue.

Mengingat Prophet membutuhkan library Python (pandas, numpy, scipy) yang tidak tersedia di PHP, dan AHP membutuhkan komputasi matriks yang intensif, kita perlu memilih pendekatan yang tidak memblokir request user.

## Decision
Kita memilih **Opsi 3: Python Background Worker** dengan arsitektur:
- Laravel memicu event → push job ke Redis Queue
- Python Worker (menggunakan RQ/Celery) consume job dari Redis
- Python melakukan komputasi AI → simpan hasil ke PostgreSQL
- Frontend polling atau WebSocket untuk mengambil hasil

## Consequences

**Positif (+):**
- **Non-blocking:** Transaksi POS tetap cepat (<200ms) karena AI diproses asynchronously.
- **Scalability:** Worker Python bisa di-scale horizontal (tambah instance) tanpa mengganggu Laravel.
- **Ecosystem:** Bisa menggunakan library Python terbaik (Prophet, scikit-learn, pandas) tanpa porting ke PHP.
- **Fault tolerance:** Jika Python worker crash, job tetap di queue dan bisa di-retry.

**Negatif (-):**
- **Complexity:** Harus maintain 2 bahasa (PHP + Python) dan 2 service.
- **Deployment:** Perlu orchestrate 2 container (Laravel + Python Worker).
- **Debugging:** Lebih sulit trace error lintas service (butuh proper logging & monitoring).
- **Latency:** Hasil AI tidak real-time (ada delay beberapa detik/menit tergantung queue).

**Mitigasi:**
- Gunakan Docker Compose untuk simplify deployment.
- Implementasi structured logging (JSON) untuk easy tracing.
- Tampilkan "Last updated: X minutes ago" di UI agar user aware data tidak real-time.