# ADR 0010: REST API with Standardized JSON Response

## Status
Accepted

## Context
WebifyLab Posky memiliki 2 klien yang akan consume API:
1. **Next.js Frontend** (Web App untuk kasir/admin)
2. **Python AI Worker** (background service untuk data access)

Ada 3 opsi API design:
1. **REST:** Resource-based, HTTP verbs, status codes standar.
2. **GraphQL:** Flexible query, single endpoint, schema-driven.
3. **tRPC:** End-to-end typesafe, cocok untuk TypeScript-only stack.

Mengingat kita punya 2 klien dengan bahasa berbeda (JavaScript & Python), dan tim sudah familiar dengan REST, kita perlu solusi yang universal dan well-documented.

## Decision
Kita memilih **REST API** dengan standar response format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 100
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The given data was invalid.",
    "errors": {
      "email": ["The email field is required."]
    }
  }
}
```

**Endpoint Structure:**
```
GET    /api/v1/products          # List
POST   /api/v1/products          # Create
GET    /api/v1/products/{id}     # Read
PUT    /api/v1/products/{id}     # Update
DELETE /api/v1/products/{id}     # Delete
POST   /api/v1/transactions      # Checkout
```

## Consequences

**Positif (+):**
- **Universal:** Semua bahasa pemrograman bisa consume REST (Python, JS, Go, dll).
- **Cacheable:** HTTP caching built-in (GET requests bisa di-cache oleh browser/CDN).
- **Tooling:** Swagger/OpenAPI auto-generation dari Laravel (via `scribe` atau `darkaonline/l5-swagger`).
- **Familiar:** Developer baru langsung paham tanpa belajar query language baru.
- **HTTP Standards:** Pakai status codes yang sudah standar (200, 201, 404, 422, 500).

**Negatif (-):**
- **Over-fetching:** Client dapat data lebih banyak dari yang dibutuhkan (boros bandwidth).
- **Under-fetching:** Butuh multiple requests untuk data relasi (N+1 problem di client).
- **Versioning:** Perlu strategi versioning (`/api/v1/`) saat ada breaking changes.
- **No Real-time:** REST tidak support push notification (butuh WebSocket terpisah).

**Mitigasi:**
- Gunakan `?include=` parameter untuk eager loading relasi (misal: `/api/v1/products?include=supplier`).
- Implementasi API versioning dari hari pertama (`/api/v1/`).
- Untuk real-time (misal: notifikasi stok menipis), tambahkan Laravel Reverb (WebSocket) nanti.
- Generate OpenAPI docs otomatis dengan `knuckleswtf/scribe` untuk frontend reference.
- Gunakan Laravel API Resources untuk transform response (konsisten format).