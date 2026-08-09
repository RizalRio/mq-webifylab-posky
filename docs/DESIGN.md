# POSKY — Design System & UI Guidelines

> **Style:** Modern SaaS / Soft Minimal  
> **Framework:** Next.js + Tailwind CSS + Shadcn UI  
> **Last Updated:** 2026-08-05

---

## 📋 Table of Contents

1. [Design Principles](#1-design-principles)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing & Grid](#4-spacing--grid)
5. [Elevation & Borders](#5-elevation--borders)
6. [Components](#6-components)
7. [Layout Patterns](#7-layout-patterns)
8. [Iconography](#8-iconography)
9. [Motion & Animation](#9-motion--animation)
10. [Dark Mode](#10-dark-mode)
11. [Accessibility](#11-accessibility)
12. [Do's & Don'ts](#12-dos--donts)

---

## 1. Design Principles

POSKY adalah aplikasi **data-dense B2B SaaS** yang dipakai kasir selama 8+ jam per hari. Setiap keputusan desain harus mendukung:

| Prinsip | Implementasi |
| --------- | -------------- |
| **🎯 Scan-able** | Hierarki visual jelas, warna netral dominan, accent hanya untuk aksi penting |
| **👆 Touch-friendly** | Target tap minimum 44×44px (kasir pakai tablet/POS) |
| **📊 Information Density** | Data banyak tapi tidak sumpek — gunakan grid 8px |
| **🌙 Eye-comfort** | Dark mode wajib, kontras lembut, hindari pure white/black |
| **🧭 Mode-aware** | 3 mode bisnis (Barang/Jasa/Sewa) punya identitas warna sendiri |
| **⚡ Fast-perceived** | Skeleton loader, optimistic UI, transisi halus |

**Inspirasi visual:** Linear, Stripe, Vercel Dashboard, Shadcn UI docs.

---

## 2. Color System

### 2.1 Brand Colors

| Token | Hex | Tailwind | Usage |
| ------- | ----- | ---------- | ------- |
| **Primary** | `#4F46E5` | `indigo-600` | CTA utama, link aktif, brand identity |
| **Primary Hover** | `#4338CA` | `indigo-700` | Hover state primary |
| **Primary Light** | `#EEF2FF` | `indigo-50` | Background badge, highlight |

### 2.2 Mode-Based Color Coding ⭐ (Signature POSKY)

Setiap mode bisnis punya warna identitas — kasir langsung tahu mode mana yang aktif tanpa mikir.

| Mode | Warna | Tailwind | Makna |
| ------ | ------- | ---------- | ------- |
| 🛒 **Barang** | Blue | `blue-500` / `blue-600` | Inventori, stok, produk fisik |
| 🛠️ **Jasa** | Violet | `violet-500` / `violet-600` | Layanan, booking, teknisi |
| 📦 **Persewaan** | Amber | `amber-500` / `amber-600` | Aset, deposit, rental |

**Implementasi:**

```html
<!-- Badge mode -->
<span class="inline-flex items-center rounded-full bg-blue-100 
             px-2.5 py-0.5 text-xs font-medium text-blue-700">
  🛒 Barang
</span>

<span class="inline-flex items-center rounded-full bg-violet-100 
             px-2.5 py-0.5 text-xs font-medium text-violet-700">
  🛠️ Jasa
</span>

<span class="inline-flex items-center rounded-full bg-amber-100 
             px-2.5 py-0.5 text-xs font-medium text-amber-700">
  📦 Persewaan
</span>
```

### 2.3 Semantic Colors

| Token | Tailwind | Usage |
| ------- | ---------- | ------- |
| **Success** | `emerald-500` / `emerald-600` | Transaksi sukses, stok aman, pembayaran lunas |
| **Warning** | `amber-500` / `amber-600` | Stok menipis, hampir jatuh tempo sewa |
| **Danger** | `rose-500` / `rose-600` | Stok habis, sewa telat, error, hapus |
| **Info** | `sky-500` / `sky-600` | Notifikasi umum, tips, info |

### 2.4 Neutral Palette

Gunakan **Slate** (lebih hangat & modern daripada Gray).

| Token | Tailwind | Usage |
| ------- | ---------- | ------- |
| Background | `slate-50` | Background utama aplikasi |
| Surface | `white` | Card, panel, modal |
| Border | `slate-200` | Divider, border card |
| Text Primary | `slate-900` | Heading, label penting |
| Text Secondary | `slate-600` | Body text |
| Text Muted | `slate-400` | Caption, placeholder |

### 2.5 Dark Mode Palette

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: 'white',
          dark: 'slate-900',
        },
        background: {
          DEFAULT: 'slate-50',
          dark: 'slate-950',
        }
      }
    }
  }
}
```

**Aturan dark mode:**

- Background: `slate-950` (bukan hitam pekat — mengurangi eye strain)
- Surface: `slate-900`
- Border: `slate-800`
- Text primary: `slate-100`
- Text secondary: `slate-400`

---

## 3. Typography

### 3.1 Font Family

```css
/* app.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}
```

### 3.2 Type Scale

| Level | Class | Usage |
| ------- | ------- | ------- |
| **Display** | `text-3xl font-bold tracking-tight` | Hero, welcome screen |
| **Page Title** | `text-2xl font-semibold` | Judul halaman |
| **Section Title** | `text-lg font-semibold` | Judul section/card |
| **Body Emphasis** | `text-base font-medium` | Label penting |
| **Body** | `text-sm` | Body text default (14px ideal untuk data-dense) |
| **Small** | `text-xs` | Caption, badge, helper text |
| **Price/Number** | `text-lg font-semibold tabular-nums` | Harga, angka penting |

### 3.3 Tabular Numbers (Wajib untuk angka!)

```html
<!-- Untuk harga, stok, total — angka sejajar di tabel -->
<p class="font-tabular tabular-nums">Rp 1.250.000</p>
```

```css
.font-tabular {
  font-variant-numeric: tabular-nums;
}
```

---

## 4. Spacing & Grid

### 4.1 Base Unit

**8px grid system** — semua spacing kelipatan 8px (2 unit Tailwind).

### 4.2 Spacing Tokens

| Token | Tailwind | Usage |
| ------- | ---------- | ------- |
| `xs` | `1` (4px) | Gap antar elemen kecil |
| `sm` | `2` (8px) | Padding dalam button kecil |
| `md` | `3` (12px) | Padding card kecil |
| `lg` | `4` (16px) | Padding card standar |
| `xl` | `6` (24px) | Padding section |
| `2xl` | `8` (32px) | Gap antar section |

### 4.3 Grid System

```html
<!-- Dashboard stats -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <!-- stat cards -->
</div>

<!-- Product grid (POS page) -->
<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
  <!-- product cards -->
</div>
```

---

## 5. Elevation & Borders

### 5.1 Border Radius

| Token | Tailwind | Usage |
| ------- | ---------- | ------- |
| `sm` | `rounded-md` | Input kecil, badge |
| `md` | `rounded-lg` | Button, card kecil |
| `lg` | `rounded-xl` | Card utama, modal |
| `full` | `rounded-full` | Avatar, pill badge |

### 5.2 Shadows (Elevation)

```css
/* tailwind.config.js */
boxShadow: {
  'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  'card': '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
  'modal': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
}
```

**Aturan:**

- Card default: `shadow-card`
- Hover card: `hover:shadow-md transition-shadow`
- Modal/dropdown: `shadow-modal`
- **Jangan** pakai shadow berlebihan — flat design lebih modern

### 5.3 Borders

```html
<!-- Border standar -->
<div class="border border-slate-200 dark:border-slate-800">

<!-- Border focus (input) -->
<input class="border border-slate-300 focus:border-indigo-500 focus:ring-2 
              focus:ring-indigo-500/20">
```

---

## 6. Components

### 6.1 Buttons

```html
<!-- Primary CTA -->
<button class="inline-flex items-center justify-center rounded-lg 
               bg-indigo-600 px-4 py-2 text-sm font-medium text-white 
               shadow-sm hover:bg-indigo-700 
               focus:outline-none focus:ring-2 focus:ring-indigo-500/50
               disabled:opacity-50 disabled:cursor-not-allowed">
  Simpan
</button>

<!-- Secondary -->
<button class="inline-flex items-center justify-center rounded-lg 
               border border-slate-300 bg-white px-4 py-2 text-sm 
               font-medium text-slate-700 hover:bg-slate-50">
  Batal
</button>

<!-- Danger -->
<button class="inline-flex items-center justify-center rounded-lg 
               bg-rose-600 px-4 py-2 text-sm font-medium text-white 
               hover:bg-rose-700">
  Hapus
</button>

<!-- Ghost (untuk toolbar) -->
<button class="inline-flex items-center justify-center rounded-lg 
               px-3 py-2 text-sm font-medium text-slate-600 
               hover:bg-slate-100">
  Filter
</button>
```

**Sizes:**

- Small: `px-3 py-1.5 text-xs`
- Default: `px-4 py-2 text-sm`
- Large: `px-5 py-2.5 text-base` (untuk CTA utama di POS)

### 6.2 Cards

```html
<!-- Card standar -->
<div class="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
  <h3 class="text-base font-semibold text-slate-900">Judul Card</h3>
  <p class="mt-1 text-sm text-slate-600">Konten card di sini.</p>
</div>

<!-- Card interactive (clickable) -->
<div class="rounded-xl border border-slate-200 bg-white p-4 shadow-card 
            hover:shadow-md hover:border-indigo-300 
            transition-all cursor-pointer">
  <!-- content -->
</div>

<!-- Card mode-aware (untuk product card di POS) -->
<div class="rounded-xl border border-slate-200 bg-white p-4 shadow-card 
            hover:shadow-md transition-shadow cursor-pointer">
  <div class="flex items-center justify-between">
    <span class="inline-flex items-center rounded-full bg-blue-100 
                 px-2.5 py-0.5 text-xs font-medium text-blue-700">
      🛒 Barang
    </span>
    <span class="text-xs text-slate-400">BRD-001</span>
  </div>
  <h3 class="mt-2 text-sm font-medium text-slate-900">Roti Gandum</h3>
  <p class="mt-1 text-lg font-semibold tabular-nums text-slate-900">
    Rp 12.000
  </p>
  <p class="mt-1 text-xs text-slate-500">Stok: 45</p>
</div>
```

### 6.3 Inputs

```html
<!-- Text input -->
<input type="text" 
       class="block w-full rounded-lg border border-slate-300 bg-white 
              px-3 py-2 text-sm text-slate-900 
              placeholder:text-slate-400
              focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
              disabled:bg-slate-50 disabled:text-slate-500">

<!-- Search input dengan icon -->
<div class="relative">
  <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" ...>
  </svg>
  <input type="search" 
         class="w-full rounded-lg border border-slate-300 bg-white 
                pl-10 pr-3 py-2 text-sm placeholder:text-slate-400
                focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
</div>
```

### 6.4 Badges & Status

```html
<!-- Status badge -->
<span class="inline-flex items-center gap-1 rounded-full bg-emerald-100 
             px-2 py-0.5 text-xs font-medium text-emerald-700">
  <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
  Tersedia
</span>

<span class="inline-flex items-center gap-1 rounded-full bg-rose-100 
             px-2 py-0.5 text-xs font-medium text-rose-700">
  <span class="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
  Habis
</span>

<span class="inline-flex items-center gap-1 rounded-full bg-amber-100 
             px-2 py-0.5 text-xs font-medium text-amber-700">
  <span class="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
  Menipis
</span>
```

### 6.5 Tables

```html
<div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
  <table class="min-w-full divide-y divide-slate-200">
    <thead class="bg-slate-50">
      <tr>
        <th class="px-4 py-3 text-left text-xs font-semibold uppercase 
                   tracking-wider text-slate-600">
          Produk
        </th>
        <th class="px-4 py-3 text-right text-xs font-semibold uppercase 
                   tracking-wider text-slate-600">
          Stok
        </th>
      </tr>
    </thead>
    <tbody class="divide-y divide-slate-200 bg-white">
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="px-4 py-3 text-sm text-slate-900">Roti Gandum</td>
        <td class="px-4 py-3 text-sm text-right tabular-nums text-slate-900">
          45
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### 6.6 Alerts / Toast

```html
<!-- Success -->
<div class="rounded-lg border border-emerald-200 bg-emerald-50 p-4 
            flex items-start gap-3">
  <svg class="h-5 w-5 text-emerald-600 flex-shrink-0">✓</svg>
  <div>
    <p class="text-sm font-medium text-emerald-900">Transaksi berhasil</p>
    <p class="mt-0.5 text-xs text-emerald-700">Stok telah diperbarui.</p>
  </div>
</div>
```

---

## 7. Layout Patterns

### 7.1 App Shell (Dashboard)

```
┌─────────────────────────────────────────────────────────┐
│ Topbar (h-16)                                           │
│ [Logo] [Tenant Switcher] [Search] [Notif] [Avatar]      │
├────────┬────────────────────────────────────────────────┤
│        │                                                │
│ Sidebar│  Main Content                                  │
│ (w-64) │  (padding: p-6)                                │
│        │                                                │
│ - Nav  │  ┌────────────────────────────────────┐        │
│ - Menu │  │ Page Header (title + actions)      │        │
│        │  ├────────────────────────────────────┤        │
│        │  │ Content Area                       │        │
│        │  │                                    │        │
└────────┴────────────────────────────────────────────────┘
```

```html
<!-- App Shell -->
<div class="min-h-screen bg-slate-50">
  <!-- Topbar -->
  <header class="h-16 border-b border-slate-200 bg-white sticky top-0 z-40">
    <!-- ... -->
  </header>
  
  <div class="flex">
    <!-- Sidebar -->
    <aside class="w-64 border-r border-slate-200 bg-white h-[calc(100vh-4rem)] 
                  sticky top-16 overflow-y-auto">
      <!-- nav -->
    </aside>
    
    <!-- Main -->
    <main class="flex-1 p-6">
      <!-- page content -->
    </main>
  </div>
</div>
```

### 7.2 POS Page (Kasir)

```
┌──────────────────────────────────────┬───────────────────┐
│  [Mode Tabs: Barang|Jasa|Sewa]       │                   │
│  [Search bar] [Category filter]      │   Cart Panel      │
│                                      │   (w-96 sticky)   │
│  ┌──────┐ ┌──────┐ ┌──────┐         │                   │
│  │ Prod │ │ Prod │ │ Prod │         │   - Items list    │
│  └──────┘ └──────┘ └──────┘         │   - Customer      │
│  ┌──────┐ ┌──────┐ ┌──────┐         │   - Subtotal      │
│  │ Prod │ │ Prod │ │ Prod │         │   - Discount      │
│  └──────┘ └──────┘ └──────┘         │   - Tax           │
│                                      │   ─────────────   │
│  [Load more / pagination]            │   TOTAL           │
│                                      │   [💳 Bayar]      │
└──────────────────────────────────────┴───────────────────┘
```

**Kunci UX:**

- Panel kiri: `flex-1 overflow-y-auto`
- Panel kanan: `w-96 sticky top-16 h-[calc(100vh-4rem)]`
- Tombol bayar: **besar & kontras** (`h-12 bg-indigo-600 text-white w-full`)

### 7.3 Analytics Page (AI Dashboard)

```
┌─────────────────────────────────────────────────┐
│ Page Header: "Analytics" + [Date Range Picker]  │
├─────────────────────────────────────────────────┤
│  [Stat 1]  [Stat 2]  [Stat 3]  [Stat 4]         │
│  (grid-cols-4)                                  │
├─────────────────────────────────────────────────┤
│  ┌────────────────────┐ ┌────────────────────┐  │
│  │ Forecast Chart     │ │ Supplier Ranking   │  │
│  │ (Prophet)          │ │ (AHP)              │  │
│  │ col-span-2         │ │ col-span-1         │  │
│  └────────────────────┘ └────────────────────┘  │
├─────────────────────────────────────────────────┤
│  [RFM Segmentation Table]                       │
│  [Cohort Heatmap]                               │
└─────────────────────────────────────────────────┘
```

---

## 8. Iconography

**Library:** [Lucide Icons](https://lucide.dev/) (modern, konsisten, tree-shakable)

```bash
npm install lucide-react
```

**Aturan:**

- Ukuran default: `h-5 w-5` (20px)
- Ukuran kecil: `h-4 w-4` (16px) — di dalam button kecil, badge
- Ukuran besar: `h-6 w-6` (24px) — di sidebar nav
- Stroke width: default (2px)
- Warna: inherit dari parent (`text-current`)

```html
<!-- Contoh -->
<button class="inline-flex items-center gap-2">
  <LucideIcon name="shopping-cart" class="h-5 w-5" />
  Checkout
</button>
```

---

## 9. Motion & Animation

**Prinsip:** *Subtle & purposeful* — animasi untuk konfirmasi, bukan dekorasi.

```css
/* tailwind.config.js */
transition: {
  'fast': '150ms ease',
  'normal': '200ms ease',
  'slow': '300ms ease',
}
```

| Aksi | Animasi | Class |
| ------ | --------- | ------- |
| Hover card | Shadow + border | `hover:shadow-md hover:border-indigo-300 transition-all` |
| Hover button | Background | `hover:bg-indigo-700 transition-colors` |
| Modal masuk | Fade + slide up | `animate-in fade-in slide-in-from-bottom-4` |
| Toast masuk | Slide from right | `animate-in slide-in-from-right` |
| Loading | Spinner | `animate-spin` |
| Skeleton | Pulse | `animate-pulse bg-slate-200` |

**Durasi:**

- Micro-interactions (hover): 150ms
- State changes (modal, dropdown): 200ms
- Page transitions: 300ms

---

## 10. Dark Mode

**Toggle:** Simpan preferensi di `localStorage`, default ikut sistem.

```js
// composables/useTheme.ts
export const useTheme = () => {
  const theme = useState('theme', () => 'light');
  
  const toggle = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark');
  };
  
  return { theme, toggle };
};
```

**Aturan penulisan class:**

```html
<!-- Selalu tulis dark mode variant -->
<div class="bg-white dark:bg-slate-900 
            border-slate-200 dark:border-slate-800
            text-slate-900 dark:text-slate-100">
```

**Palet dark mode:**

| Light | Dark |
| ------- | ------ |
| `bg-slate-50` | `bg-slate-950` |
| `bg-white` | `bg-slate-900` |
| `border-slate-200` | `border-slate-800` |
| `text-slate-900` | `text-slate-100` |
| `text-slate-600` | `text-slate-400` |
| `text-slate-400` | `text-slate-500` |

---

## 11. Accessibility

### 11.1 Kontras Warna

- Text normal: minimum **4.5:1** terhadap background
- Text besar (18px+ bold): minimum **3:1**
- Gunakan [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### 11.2 Focus States

**WAJIB** ada focus ring untuk keyboard navigation:

```html
<button class="focus:outline-none focus:ring-2 focus:ring-indigo-500/50 
               focus:ring-offset-2">
```

### 11.3 Touch Targets

- Minimum **44×44px** untuk semua elemen interaktif
- Gunakan `min-h-[44px]` pada button di mobile

### 11.4 ARIA

```html
<!-- Icon-only button -->
<button aria-label="Hapus item">
  <TrashIcon class="h-5 w-5" />
</button>

<!-- Loading state -->
<button aria-busy="true" disabled>
  <span class="sr-only">Memproses...</span>
  <SpinnerIcon class="animate-spin" />
</button>
```

---

## 12. Do's & Don'ts

### ✅ Do's

- ✅ Gunakan warna mode (blue/violet/amber) untuk **identifikasi mode bisnis**
- ✅ Pakai `tabular-nums` untuk **semua angka** (harga, stok, total)
- ✅ Terapkan **dark mode** di semua komponen sejak awal
- ✅ Gunakan **skeleton loader** saat data loading
- ✅ Konsisten pakai **rounded-xl** untuk card, **rounded-lg** untuk button
- ✅ Padding minimal **p-4** untuk card, **p-6** untuk section
- ✅ Selalu tulis **dark mode variant** di setiap class

### ❌ Don'ts

- ❌ Jangan pakai **pure white** (`#FFFFFF`) untuk background aplikasi — gunakan `slate-50`
- ❌ Jangan pakai **pure black** untuk dark mode — gunakan `slate-950`
- ❌ Jangan pakai lebih dari **3 warna accent** dalam satu layar
- ❌ Jangan pakai shadow berlebihan (max `shadow-lg`, jangan `shadow-2xl`)
- ❌ Jangan pakai font size di bawah `text-xs` (12px)
- ❌ Jangan pakai warna mode untuk semantic (jangan pakai `blue` untuk error)
- ❌ Jangan campur border radius (jangan ada card `rounded-lg` di sebelah `rounded-2xl`)

---

## 📦 Tech Stack UI

| Layer | Tech | Alasan |
| ------- | ------ | -------- |
| **Framework** | Next.js 14+ (App Router) | SSR, SSG, React ecosystem terbesar, DX terbaik |
| **Component Library** | Shadcn UI (Radix UI primitives) | Built on Tailwind CSS, fully customizable, dark mode otomatis |
| **CSS** | Tailwind CSS | Utility-first, cepat, konsisten |
| **Icons** | Lucide React (`lucide-react`) | Modern, tree-shakable, konsisten |
| **Charts** | Recharts / ECharts (`echarts-for-react`) | Fleksibel, support confidence interval untuk Prophet |
| **Date Picker** | Shadcn UI Date Picker (`react-day-picker`) | Native React integration |
| **Forms** | React Hook Form + Zod | Type-safe validation & high performance |
| **State Management** | Zustand + TanStack Query | Global state & server state caching |

---

## 🎨 Quick Reference

```
PRIMARY    : indigo-600
BARANG     : blue-500
JASA       : violet-500
SEWA       : amber-500
SUCCESS    : emerald-500
WARNING    : amber-500
DANGER     : rose-500
INFO       : sky-500
BACKGROUND : slate-50 / slate-950 (dark)
SURFACE    : white / slate-900 (dark)
BORDER     : slate-200 / slate-800 (dark)
TEXT       : slate-900 / slate-100 (dark)
RADIUS     : rounded-lg (button), rounded-xl (card)
FONT       : Inter, 14px base, tabular-nums untuk angka
```

---

**Dokumen ini adalah "single source of truth" untuk UI POSKY.**  
Setiap perubahan design system harus di-update di sini terlebih dahulu.
