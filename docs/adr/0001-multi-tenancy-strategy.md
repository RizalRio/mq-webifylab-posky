# ADR 0001: Multi-Tenancy Strategy (Shared Schema)

## Status
Accepted

## Context
WebifyLab Posky adalah SaaS untuk UMKM. Kita perlu mengisolasi data antar tenant (UMKM) agar aman. 
Ada 3 strategi umum:
1. **Database-per-Tenant:** Isolasi fisik penuh.
2. **Schema-per-Tenant:** Satu DB, beda schema PostgreSQL.
3. **Shared Schema:** Satu DB, satu schema, dipisahkan oleh kolom `tenant_id`.

Mengingat timeline project hanya 8 minggu dan target user adalah UMKM (bukan enterprise dengan kepatuhan HIPAA/SOC2 ketat), kita butuh solusi yang cepat dieksekusi dan murah secara infrastruktur.

## Decision
Kita memilih **Shared Schema** dengan kolom `tenant_id` (UUID) di setiap tabel, dan menggunakan **Laravel Global Scopes** untuk memaksa isolasi data di level ORM.

## Consequences
**Positif (+):**
- Biaya infrastruktur sangat murah (hanya 1 instance PostgreSQL).
- Migrasi database (Laravel Migrate) sangat mudah, hanya perlu jalankan 1x.
- Query lintas tenant (misal: untuk Super Admin WebifyLab) sangat mudah dilakukan.

**Negatif (-):**
- Risiko kebocoran data (*cross-tenant leakage*) tinggi jika developer lupa menerapkan Global Scope di raw query.
- Tabel akan menjadi sangat besar seiring bertambahnya tenant (butuh *partitioning* di masa depan jika sudah > 100 tenant aktif).