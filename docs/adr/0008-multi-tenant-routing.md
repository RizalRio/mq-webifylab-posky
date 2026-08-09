# ADR 0008: Multi-tenant Routing via Subdomain

## Status
Accepted

## Context
WebifyLab Posky adalah SaaS yang akan dipakai banyak UMKM. Setiap UMKM butuh "ruang" sendiri di aplikasi.

Ada 3 strategi routing multi-tenant:
1. **Path-based:** `webifylab.com/toko-a`, `webifylab.com/toko-b`
2. **Subdomain:** `toko-a.webifylab.com`, `toko-b.webifylab.com`
3. **Custom Domain:** `pos.toko-a.com` (tiap tenant punya domain sendiri)

Mengingat target user adalah UMKM yang butuh branding sederhana, dan kita ingin memudahkan SSL wildcard, kita perlu memilih strategi yang balance antara UX dan technical complexity.

## Decision
Kita memilih **Subdomain-based routing** untuk MVP:
- Format: `{tenant_subdomain}.webifylab.com`
- Contoh: `bakery-sehat.webifylab.com`, `bengkel-jaya.webifylab.com`
- Central app: `app.webifylab.com` (untuk landing page & super admin)

## Consequences

**Positif (+):**
- **Clear Separation:** Setiap tenant terasa seperti punya "aplikasi sendiri".
- **Cookie Isolation:** Cookie per subdomain tidak bocor ke tenant lain (security +).
- **Wildcard SSL:** Cukup 1 SSL certificate untuk `*.webifylab.com` (Let's Encrypt support).
- **Easy DNS:** Hanya perlu 1 wildcard A record `*.webifylab.com` → IP server.
- **Branding:** Tenant bisa upgrade ke custom domain di masa depan tanpa ubah arsitektur.

**Negatif (-):**
- **CORS Complexity:** Jika frontend dan backend beda subdomain, perlu setup CORS.
- **Cookie Sharing:** Session cookie tidak bisa share antar subdomain (butuh setup khusus jika perlu).
- **Subdomain Limit:** Tidak semua user paham konsep subdomain (UX concern).
- **DNS Propagation:** Jika pakai custom domain di masa depan, ada delay 24-48 jam.

**Mitigasi:**
- Setup CORS di Laravel untuk allow `*.webifylab.com`.
- Gunakan `php artisan serve` dengan dynamic host detection untuk development.
- Di Next.js, gunakan Environment Variables (`NEXT_PUBLIC_APP_DOMAIN`, `NEXT_PUBLIC_API_BASE_URL`) untuk base URL yang dinamis.
- Untuk development lokal, pakai `nip.io` atau `lvh.me` (misal: `toko-a.lvh.me:8000`).
- Dokumentasi cara setup `/etc/hosts` untuk local subdomain testing.