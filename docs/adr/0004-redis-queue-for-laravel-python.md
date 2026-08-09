# ADR 0004: Redis Queue for Laravel-Python Communication

## Status
Accepted

## Context
Laravel (PHP) dan Python Worker perlu berkomunikasi untuk trigger job AI (forecasting & AHP scoring).

Ada 4 opsi pattern komunikasi:
1. **REST API Internal:** Laravel call Python via HTTP endpoint.
2. **Direct Execution:** Laravel execute Python script via `shell_exec()`.
3. **Message Queue (Redis/RabbitMQ):** Laravel push job ke queue, Python consume.
4. **gRPC:** High-performance RPC framework.

Mengingat Python Worker adalah background service (bukan real-time), dan kita sudah menggunakan Redis untuk caching, kita perlu memilih pattern yang simple namun reliable.

## Decision
Kita memilih **Opsi 3: Redis Queue** dengan implementasi:
- Laravel menggunakan `Illuminate\Support\Facades\Queue` dengan driver Redis
- Python menggunakan `RQ (Redis Queue)` atau `Celery` untuk consume job
- Job payload berupa JSON: `{"tenant_id": "...", "product_id": "...", "action": "forecast"}`

## Consequences

**Positif (+):**
- **Asynchronous:** Laravel tidak perlu tunggu Python selesai, langsung return response.
- **Retry Mechanism:** Jika Python gagal, job bisa di-retry otomatis (exponential backoff).
- **Load Balancing:** Multiple Python workers bisa consume dari queue yang sama.
- **Monitoring:** Bisa monitor queue length, failed jobs, processing time via Redis CLI atau dashboard.
- **Reuse Infrastructure:** Redis sudah dipakai untuk caching, tidak perlu tambah service baru (seperti RabbitMQ).

**Negatif (-):**
- **Eventual Consistency:** Data hasil AI tidak langsung tersedia (ada delay).
- **Complexity:** Perlu handle job serialization, error handling, dan dead letter queue.
- **Redis Dependency:** Jika Redis down, queue berhenti (single point of failure).

**Mitigasi:**
- Implementasi "stale data" strategy: tampilkan hasil AI terakhir sambil queue proses yang baru.
- Setup Redis Sentinel atau cluster untuk high availability (di production).
- Monitor queue dengan Laravel Horizon (untuk Laravel side) dan RQ Dashboard (untuk Python side).
- Set maximum retry attempts dan move failed jobs ke "dead letter queue" untuk manual inspection.