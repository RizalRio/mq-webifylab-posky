# ADR 0009: Frontend State Management (Zustand & TanStack Query over Redux Toolkit)

## Status
Accepted

## Context
Next.js frontend membutuhkan state management untuk:
- Menyimpan data user session & tenant info yang sedang login
- Mengelola UI state (cart kasir, sidebar collapsed, theme, modal active)
- Caching data dari REST API Backend (produk, transaksi, rekomendasi AHP, forecast Prophet)

Ada beberapa opsi di ekosistem React / Next.js:
1. **Redux Toolkit (RTK):** Solusi teruji dan sangat populer, namun membutuhkan banyak boilerplate code.
2. **Zustand + TanStack Query (React Query):** Pemisahan tegas antara client-state (Zustand) dan server-state caching (TanStack Query). Sangat ringan, terstruktur, dan modern.
3. **React Context API:** Bawaan React tanpa library tambahan, namun rentan menyebabkan unnecessary re-renders jika state berkembang kompleks.

Mengingat kita menggunakan Next.js (React & App Router) dan butuh pergerakan cepat, performa tinggi, serta TypeScript support yang kuat, kita perlu solusi modular yang maintainable.

## Decision
Kita memilih **kombinasi Zustand (Client State) dan TanStack Query (Server State)** dengan struktur modular:

```
src/
├── stores/                # Zustand Client Stores
│   ├── useAuthStore.ts    # User session & tenant info
│   ├── usePosStore.ts     # Cart kasir & transaksi aktif
│   └── useUiStore.ts      # Sidebar state, theme, modal, toast
└── hooks/                 # TanStack Query Hooks (Server State)
    ├── useProducts.ts     # Catalog data caching & mutations
    ├── useTransactions.ts # Order creation & history
    └── useAiAnalytics.ts  # AHP recommendations & Prophet forecasts
```

## Consequences

**Positif (+):**
- **Separation of Concerns:** Client state (cart/UI) dan server state (API response cache) terpisah dengan rapi.
- **Minimal Boilerplate:** Zustand sangat intuitif tanpa action-creator/reducer berlebihan.
- **Auto Caching & Refetching:** TanStack Query menangani deduplikasi request, caching, background refetching, dan stale-time secara otomatis.
- **Lightweight & High Performance:** Ukuran bundle Zustand (~1KB) jauh lebih kecil dari Redux, dan selector pattern mencegah re-render komponen secara agresif.
- **SSR & React Server Components Compatible:** Kompatibel dengan Next.js App Router.

**Negatif (-):**
- **Dua Library Terpisah:** Perlu memahami batasan antara kapan menggunakan Zustand vs TanStack Query.

**Mitigasi:**
- Gunakan aturan sederhana: Jika data berasal dari API Laravel, gunakan **TanStack Query**. Jika data bersifat transient/UI lokal (keranjang belanja kasir, toggle sidebar), gunakan **Zustand**.
- Dokumentasi panduan penggunaan state management untuk menjaga konsistensi tim.