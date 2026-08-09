# ADR 0005: PostgreSQL as Primary Database

## Status
Accepted

## Context
WebifyLab Posky membutuhkan database relasional untuk menyimpan data multi-tenant, transaksi, dan hasil AI.

Ada 2 kandidat utama:
1. **MySQL/MariaDB:** Populer di shared hosting, mudah setup, ecosystem PHP yang matang.
2. **PostgreSQL:** Advanced features (JSONB, window functions, materialized views), ACID compliant, robust.

Mengingat project ini membutuhkan:
- JSONB untuk menyimpan konfigurasi dinamis per tenant
- Window functions untuk RFM & Cohort analysis
- Materialized views untuk analytics dashboard
- Strict ACID compliance untuk transaksi finansial

## Decision
Kita memilih **PostgreSQL 15+** sebagai primary database.

## Consequences

**Positif (+):**
- **JSONB Support:** Bisa simpan konfigurasi tenant yang fleksibel tanpa schema migration.
- **Advanced Analytics:** Window functions, CTEs, dan materialized views sangat powerful untuk RFM/Cohort.
- **Data Integrity:** Strict type checking, CHECK constraints, dan EXCLUDE constraints.
- **Full-Text Search:** Native full-text search tanpa perlu Elasticsearch untuk MVP.
- **Array & HSTORE:** Bisa simpan array langsung di kolom (misal: `tags TEXT[]`).
- **Row Level Security (RLS):** Bisa enforce multi-tenancy di level database (extra security layer).

**Negatif (-):**
- **Learning Curve:** Syntax dan features lebih kompleks dibanding MySQL.
- **Hosting Availability:** Tidak semua shared hosting support PostgreSQL (tapi VPS semua support).
- **PHP Ecosystem:** Beberapa Laravel package lebih optimized untuk MySQL (tapi mayoritas support Postgres).
- **Performance:** Untuk simple queries, MySQL sedikit lebih cepat (tapi Postgres menang di complex queries).

**Mitigasi:**
- Gunakan Docker untuk development (tidak perlu install manual).
- Pilih VPS provider yang support PostgreSQL (DigitalOcean, Vultr, AWS RDS).
- Test semua Laravel package di PostgreSQL sebelum adopt.
- Gunakan Laravel's query builder (database-agnostic) daripada raw SQL.