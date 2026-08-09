# ADR 0006: Authentication Strategy (Laravel Sanctum)

## Status
Accepted

## Context
WebifyLab Posky adalah SaaS multi-tenant dengan 2 jenis klien:
1. **SPA / Web App (Next.js)** yang diakses via browser oleh kasir/admin UMKM.
2. **Python AI Worker** yang perlu mengakses database untuk membaca data historis.

Ada 3 opsi autentikasi di Laravel:
1. **Laravel Passport:** Full OAuth2 server, cocok untuk public API.
2. **Laravel Sanctum:** Token-based auth sederhana, cocok untuk SPA & mobile.
3. **JWT (tymon/jwt-auth):** Stateless token, populer tapi perlu maintenance ekstra.

Karena tidak ada pihak ketiga yang perlu akses API (bukan public API), dan kita butuh session-based auth untuk SPA + token untuk Python worker, kita perlu solusi yang ringan namun aman.

## Decision
Kita memilih **Laravel Sanctum** dengan 2 mode:
- **SPA Authentication:** Cookie-based session (first-party) untuk Next.js.
- **API Token:** Personal Access Token (PAT) untuk Python Worker dan integrasi masa depan.

## Consequences

**Positif (+):**
- **Lightweight:** Tidak perlu setup OAuth2 server yang kompleks.
- **SPA-friendly:** Native support untuk first-party SPA dengan CSRF protection.
- **Token Scoping:** Bisa batasi ability token (misal: Python worker hanya bisa `read:transactions`).
- **Official Support:** Maintained by Laravel team, terintegrasi rapi dengan ecosystem.
- **Easy Migration:** Jika nanti butuh OAuth2, bisa upgrade ke Passport dengan minimal perubahan.

**Negatif (-):**
- **Not Stateless:** Cookie-based session butuh Redis untuk session storage (tapi kita sudah pakai Redis).
- **No OAuth2:** Tidak bisa dipakai untuk "Login with WebifyLab" di aplikasi pihak ketiga.
- **Token Management:** PAT tidak punya expiration otomatis (perlu custom logic).

**Mitigasi:**
- Setup Redis sebagai session driver untuk performa & scalability.
- Implementasi custom command `sanctum:prune-expired` untuk cleanup token.
- Untuk Python Worker, simpan token di environment variable (jangan hardcode).