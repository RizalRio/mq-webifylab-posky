# WebifyLab Posky — API Endpoint Documentation

> **Base URL:** `https://api.webifylab.com/api/v1`  
> **Interactive Docs:** [Swagger UI](https://api.webifylab.com/docs)  
> **Version:** 1.0.0  
> **Last Updated:** 2026-01-29

---

## 📋 Table of Contents
1. [Authentication](#1-authentication)
2. [Tenant Management](#2-tenant-management)
3. [Products (Barang Mode)](#3-products-barang-mode)
4. [Services (Jasa Mode)](#4-services-jasa-mode)
5. [Rental Items (Persewaan Mode)](#5-rental-items-persewaan-mode)
6. [Transactions](#6-transactions)
7. [Customers](#7-customers)
8. [Suppliers](#8-suppliers)
9. [Analytics & AI](#9-analytics--ai)

---

## 🌐 Global Headers

Semua endpoint (kecuali `/auth/*`) wajib menyertakan:

```http
Accept: application/json
Authorization: Bearer {token}
X-Tenant-ID: {tenant_uuid}  # Fallback jika tidak pakai subdomain
```

---

## 1. Authentication

### 1.1 Register New Tenant
**Endpoint:** `POST /auth/register`  
**Access:** Public  
**Description:** Mendaftar tenant baru (UMKM) di sistem.

**Request Body:**
```json
{
  "name": "Bakery Sehat",
  "email": "admin@bakerysehat.com",
  "password": "securePassword123",
  "password_confirmation": "securePassword123",
  "subdomain": "bakery-sehat",
  "business_type": "barang"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "tenant": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Bakery Sehat",
      "subdomain": "bakery-sehat",
      "business_type": "barang",
      "created_at": "2026-01-29T10:00:00Z"
    },
    "user": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Admin",
      "email": "admin@bakerysehat.com",
      "role": "admin"
    },
    "token": "1|abc123xyz..."
  }
}
```

**Validation Rules:**
- `name`: required, string, max:255
- `email`: required, email, unique:users
- `password`: required, string, min:8, confirmed
- `subdomain`: required, string, max:100, unique:tenants, regex:/^[a-z0-9-]+$/
- `business_type`: required, in:barang,jasa,persewaan,hybrid

**Error Responses:**
- `422 Unprocessable Entity`: Validation failed
- `409 Conflict`: Subdomain already taken

---

### 1.2 Login
**Endpoint:** `POST /auth/login`  
**Access:** Public  
**Description:** Authenticate user dan dapatkan token.

**Request Body:**
```json
{
  "email": "admin@bakerysehat.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Admin",
      "email": "admin@bakerysehat.com",
      "role": "admin",
      "tenant_id": "550e8400-e29b-41d4-a716-446655440000"
    },
    "token": "1|abc123xyz..."
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid credentials
- `403 Forbidden`: Account suspended

---

### 1.3 Logout
**Endpoint:** `POST /auth/logout`  
**Access:** Authenticated  
**Description:** Revoke current token.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 1.4 Get Current User
**Endpoint:** `GET /auth/me`  
**Access:** Authenticated  
**Description:** Get profil user yang sedang login.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "Admin",
    "email": "admin@bakerysehat.com",
    "role": "admin",
    "tenant": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Bakery Sehat",
      "subdomain": "bakery-sehat",
      "business_type": "barang"
    }
  }
}
```

---

## 2. Tenant Management

> **Note:** Endpoint ini hanya untuk **Super Admin** WebifyLab (bukan tenant user).

### 2.1 List All Tenants
**Endpoint:** `GET /admin/tenants`  
**Access:** Super Admin  
**Description:** Daftar semua tenant di sistem.

**Query Parameters:**
- `page`: integer (default: 1)
- `per_page`: integer (default: 20, max: 100)
- `search`: string (search by name/subdomain)
- `business_type`: string (filter by type)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Bakery Sehat",
      "subdomain": "bakery-sehat",
      "business_type": "barang",
      "status": "active",
      "created_at": "2026-01-29T10:00:00Z",
      "user_count": 5,
      "transaction_count": 1250
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 45,
    "last_page": 3
  }
}
```

---

## 3. Products (Barang Mode)

### 3.1 List Products
**Endpoint:** `GET /products`  
**Access:** Authenticated (tenant-scoped)  
**Description:** Daftar semua produk untuk tenant aktif.

**Query Parameters:**
- `page`: integer
- `per_page`: integer
- `search`: string (search by name/SKU)
- `category`: string (filter by category)
- `low_stock`: boolean (filter products with stock < min_threshold)
- `sort`: string (name, stock, price, created_at)
- `order`: string (asc, desc)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "sku": "BRD-001",
      "name": "Roti Gandum",
      "category": "Bread",
      "stock": 45,
      "min_stock_threshold": 10,
      "cost_price": 8000,
      "sell_price": 12000,
      "supplier_id": "880e8400-e29b-41d4-a716-446655440003",
      "supplier": {
        "id": "880e8400-e29b-41d4-a716-446655440003",
        "name": "PT Flour Mills"
      },
      "is_low_stock": false,
      "created_at": "2026-01-15T08:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 150
  }
}
```

---

### 3.2 Create Product
**Endpoint:** `POST /products`  
**Access:** Authenticated (admin, manajer)  
**Description:** Tambah produk baru.

**Request Body:**
```json
{
  "sku": "BRD-002",
  "name": "Roti Cokelat",
  "category": "Bread",
  "stock": 0,
  "min_stock_threshold": 15,
  "cost_price": 9000,
  "sell_price": 14000,
  "supplier_id": "880e8400-e29b-41d4-a716-446655440003"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440003",
    "sku": "BRD-002",
    "name": "Roti Cokelat",
    "category": "Bread",
    "stock": 0,
    "min_stock_threshold": 15,
    "cost_price": 9000,
    "sell_price": 14000,
    "supplier_id": "880e8400-e29b-41d4-a716-446655440003",
    "created_at": "2026-01-29T11:00:00Z"
  }
}
```

**Validation Rules:**
- `sku`: required, string, unique:products (scoped by tenant_id)
- `name`: required, string, max:255
- `category`: nullable, string, max:100
- `stock`: required, integer, min:0
- `min_stock_threshold`: required, integer, min:0
- `cost_price`: required, numeric, min:0
- `sell_price`: required, numeric, min:0, gt:cost_price
- `supplier_id`: nullable, exists:suppliers,id (scoped by tenant_id)

---

### 3.3 Get Product Detail
**Endpoint:** `GET /products/{id}`  
**Access:** Authenticated  
**Description:** Detail produk lengkap dengan riwayat transaksi.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "sku": "BRD-001",
    "name": "Roti Gandum",
    "category": "Bread",
    "stock": 45,
    "min_stock_threshold": 10,
    "cost_price": 8000,
    "sell_price": 12000,
    "supplier": {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "name": "PT Flour Mills",
      "score": 0.85,
      "rank": 1
    },
    "forecast": {
      "next_7_days": 120,
      "confidence_interval": [100, 140]
    },
    "recent_transactions": [
      {
        "id": "990e8400-e29b-41d4-a716-446655440010",
        "date": "2026-01-28T15:30:00Z",
        "quantity": 5,
        "total": 60000
      }
    ],
    "created_at": "2026-01-15T08:00:00Z",
    "updated_at": "2026-01-28T15:30:00Z"
  }
}
```

---

### 3.4 Update Product
**Endpoint:** `PUT /products/{id}`  
**Access:** Authenticated (admin, manajer)  
**Description:** Update informasi produk.

**Request Body:** (partial update allowed)
```json
{
  "stock": 100,
  "sell_price": 13000,
  "min_stock_threshold": 20
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "stock": 100,
    "sell_price": 13000,
    "min_stock_threshold": 20,
    "updated_at": "2026-01-29T12:00:00Z"
  }
}
```

---

### 3.5 Delete Product
**Endpoint:** `DELETE /products/{id}`  
**Access:** Authenticated (admin)  
**Description:** Soft delete produk (tidak bisa dihapus jika ada transaksi terkait).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

**Error Responses:**
- `409 Conflict`: Product has transactions, cannot delete

---

## 4. Services (Jasa Mode)

### 4.1 List Services
**Endpoint:** `GET /services`  
**Access:** Authenticated  
**Description:** Daftar semua jasa/layanan.

**Query Parameters:**
- `page`, `per_page`, `search`, `sort`, `order`

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "100e8400-e29b-41d4-a716-446655440020",
      "name": "Service AC",
      "description": "Cuci dan cek freon",
      "duration_minutes": 60,
      "price": 150000,
      "created_at": "2026-01-10T09:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 15
  }
}
```

---

### 4.2 Create Service
**Endpoint:** `POST /services`  
**Access:** Authenticated (admin, manajer)

**Request Body:**
```json
{
  "name": "Ganti Oli Motor",
  "description": "Ganti oli + filter",
  "duration_minutes": 30,
  "price": 85000
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "100e8400-e29b-41d4-a716-446655440021",
    "name": "Ganti Oli Motor",
    "description": "Ganti oli + filter",
    "duration_minutes": 30,
    "price": 85000,
    "created_at": "2026-01-29T13:00:00Z"
  }
}
```

---

### 4.3 Get Service Schedule
**Endpoint:** `GET /services/{id}/schedule`  
**Access:** Authenticated  
**Description:** Jadwal booking untuk service tertentu.

**Query Parameters:**
- `date`: required, date (YYYY-MM-DD)
- `technician_id`: optional, uuid (filter by technician)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "service_id": "100e8400-e29b-41d4-a716-446655440020",
    "date": "2026-01-30",
    "slots": [
      {
        "start": "09:00",
        "end": "10:00",
        "status": "booked",
        "technician": {
          "id": "110e8400-e29b-41d4-a716-446655440030",
          "name": "Budi Santoso"
        },
        "customer": {
          "id": "120e8400-e29b-41d4-a716-446655440040",
          "name": "Ahmad"
        }
      },
      {
        "start": "10:00",
        "end": "11:00",
        "status": "available"
      }
    ]
  }
}
```

---

## 5. Rental Items (Persewaan Mode)

### 5.1 List Rental Items
**Endpoint:** `GET /rental-items`  
**Access:** Authenticated  
**Description:** Daftar semua item yang bisa disewakan.

**Query Parameters:**
- `page`, `per_page`, `search`, `status` (available, rented, maintenance)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "130e8400-e29b-41d4-a716-446655440050",
      "serial_number": "CAM-001",
      "name": "Kamera Sony A7III",
      "category": "Camera",
      "daily_rate": 250000,
      "deposit_amount": 2000000,
      "status": "available",
      "current_rental": null,
      "created_at": "2026-01-05T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 30
  }
}
```

---

### 5.2 Create Rental Item
**Endpoint:** `POST /rental-items`  
**Access:** Authenticated (admin, manajer)

**Request Body:**
```json
{
  "serial_number": "CAM-002",
  "name": "Kamera Canon R5",
  "category": "Camera",
  "daily_rate": 300000,
  "deposit_amount": 2500000
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "130e8400-e29b-41d4-a716-446655440051",
    "serial_number": "CAM-002",
    "name": "Kamera Canon R5",
    "category": "Camera",
    "daily_rate": 300000,
    "deposit_amount": 2500000,
    "status": "available",
    "created_at": "2026-01-29T14:00:00Z"
  }
}
```

---

### 5.3 Get Rental Item Detail
**Endpoint:** `GET /rental-items/{id}`  
**Access:** Authenticated  
**Description:** Detail item sewa dengan riwayat penyewaan.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "130e8400-e29b-41d4-a716-446655440050",
    "serial_number": "CAM-001",
    "name": "Kamera Sony A7III",
    "category": "Camera",
    "daily_rate": 250000,
    "deposit_amount": 2000000,
    "status": "rented",
    "current_rental": {
      "id": "140e8400-e29b-41d4-a716-446655440060",
      "customer": {
        "id": "120e8400-e29b-41d4-a716-446655440040",
        "name": "Ahmad"
      },
      "start_date": "2026-01-28",
      "end_date": "2026-01-31",
      "days_remaining": 2
    },
    "rental_history": [
      {
        "id": "140e8400-e29b-41d4-a716-446655440055",
        "customer_name": "Budi",
        "start_date": "2026-01-10",
        "end_date": "2026-01-15",
        "total_amount": 1250000,
        "late_fee": 0
      }
    ]
  }
}
```

---

## 6. Transactions

### 6.1 List Transactions
**Endpoint:** `GET /transactions`  
**Access:** Authenticated  
**Description:** Daftar semua transaksi (barang, jasa, sewa).

**Query Parameters:**
- `page`, `per_page`
- `type`: string (sale, service, rental)
- `date_from`, `date_to`: date (YYYY-MM-DD)
- `customer_id`: uuid
- `status`: string (completed, pending, cancelled)
- `sort`: string (created_at, total_amount)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440010",
      "type": "sale",
      "customer": {
        "id": "120e8400-e29b-41d4-a716-446655440040",
        "name": "Ahmad"
      },
      "cashier": {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "name": "Admin"
      },
      "items_count": 3,
      "total_amount": 150000,
      "status": "completed",
      "created_at": "2026-01-28T15:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 500
  }
}
```

---

### 6.2 Create Transaction (Checkout)
**Endpoint:** `POST /transactions`  
**Access:** Authenticated (kasir, admin)  
**Description:** Buat transaksi baru (universal untuk 3 mode).

**Request Body (Mode Barang):**
```json
{
  "type": "sale",
  "customer_id": "120e8400-e29b-41d4-a716-446655440040",
  "items": [
    {
      "itemable_type": "App\\Models\\Product",
      "itemable_id": "770e8400-e29b-41d4-a716-446655440002",
      "quantity": 5,
      "unit_price": 12000
    }
  ],
  "discount": 5000,
  "tax": 10000,
  "payment_method": "cash"
}
```

**Request Body (Mode Jasa):**
```json
{
  "type": "service",
  "customer_id": "120e8400-e29b-41d4-a716-446655440040",
  "items": [
    {
      "itemable_type": "App\\Models\\Service",
      "itemable_id": "100e8400-e29b-41d4-a716-446655440020",
      "quantity": 1,
      "unit_price": 150000,
      "scheduled_start": "2026-01-30T09:00:00Z",
      "technician_id": "110e8400-e29b-41d4-a716-446655440030"
    }
  ],
  "payment_method": "transfer"
}
```

**Request Body (Mode Persewaan):**
```json
{
  "type": "rental",
  "customer_id": "120e8400-e29b-41d4-a716-446655440040",
  "items": [
    {
      "itemable_type": "App\\Models\\RentalItem",
      "itemable_id": "130e8400-e29b-41d4-a716-446655440050",
      "quantity": 1,
      "unit_price": 250000,
      "start_date": "2026-01-29",
      "end_date": "2026-02-02"
    }
  ],
  "deposit_paid": 2000000,
  "payment_method": "cash"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "990e8400-e29b-41d4-a716-446655440011",
    "type": "sale",
    "customer": {
      "id": "120e8400-e29b-41d4-a716-446655440040",
      "name": "Ahmad"
    },
    "cashier": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Admin"
    },
    "items": [
      {
        "id": "991e8400-e29b-41d4-a716-446655440012",
        "itemable_type": "App\\Models\\Product",
        "itemable_id": "770e8400-e29b-41d4-a716-446655440002",
        "itemable": {
          "name": "Roti Gandum",
          "sku": "BRD-001"
        },
        "quantity": 5,
        "unit_price": 12000,
        "subtotal": 60000
      }
    ],
    "subtotal": 60000,
    "discount": 5000,
    "tax": 10000,
    "total_amount": 65000,
    "payment_method": "cash",
    "status": "completed",
    "created_at": "2026-01-29T15:00:00Z"
  }
}
```

**Business Logic:**
- **Mode Barang:** Otomatis kurangi stok produk
- **Mode Jasa:** Otomatis buat `service_schedule` dan cek ketersediaan teknisi
- **Mode Persewaan:** Otomatis buat `rental_booking`, update status item jadi "rented"

**Error Responses:**
- `422 Unprocessable Entity`: Stok tidak cukup / teknisi sudah booked / item sedang disewa
- `409 Conflict`: Rental item not available

---

### 6.3 Get Transaction Detail
**Endpoint:** `GET /transactions/{id}`  
**Access:** Authenticated  
**Description:** Detail transaksi lengkap dengan semua item.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "990e8400-e29b-41d4-a716-446655440010",
    "type": "rental",
    "customer": {
      "id": "120e8400-e29b-41d4-a716-446655440040",
      "name": "Ahmad",
      "phone": "081234567890"
    },
    "cashier": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Admin"
    },
    "items": [
      {
        "id": "991e8400-e29b-41d4-a716-446655440012",
        "itemable_type": "App\\Models\\RentalItem",
        "itemable_id": "130e8400-e29b-41d4-a716-446655440050",
        "itemable": {
          "name": "Kamera Sony A7III",
          "serial_number": "CAM-001"
        },
        "quantity": 1,
        "unit_price": 250000,
        "subtotal": 1000000,
        "rental_booking": {
          "start_date": "2026-01-28",
          "end_date": "2026-01-31",
          "actual_return_date": null,
          "days": 4,
          "late_fee": 0
        }
      }
    ],
    "subtotal": 1000000,
    "deposit_paid": 2000000,
    "total_amount": 1000000,
    "status": "completed",
    "created_at": "2026-01-28T10:00:00Z"
  }
}
```

---

### 6.4 Return Rental Item
**Endpoint:** `POST /transactions/{id}/return`  
**Access:** Authenticated (kasir, admin)  
**Description:** Proses pengembalian item sewa (hitung denda jika terlambat).

**Request Body:**
```json
{
  "actual_return_date": "2026-02-01",
  "condition": "good",
  "notes": "Ada goresan kecil di lensa"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "transaction_id": "990e8400-e29b-41d4-a716-446655440010",
    "actual_return_date": "2026-02-01",
    "expected_return_date": "2026-01-31",
    "days_late": 1,
    "late_fee": 250000,
    "deposit_refund": 1750000,
    "total_charged": 1250000
  }
}
```

**Business Logic:**
- Hitung selisih hari antara `actual_return_date` dan `end_date`
- Jika terlambat, kalikan `daily_rate` dengan jumlah hari terlambat
- Kurangi deposit dengan total biaya sewa + denda
- Update status rental item jadi "available"

---

## 7. Customers

### 7.1 List Customers
**Endpoint:** `GET /customers`  
**Access:** Authenticated  
**Description:** Daftar pelanggan.

**Query Parameters:**
- `page`, `per_page`, `search` (name/phone/email)
- `sort`: string (name, created_at, total_spent)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "120e8400-e29b-41d4-a716-446655440040",
      "name": "Ahmad",
      "phone": "081234567890",
      "email": "ahmad@example.com",
      "total_transactions": 15,
      "total_spent": 2500000,
      "last_transaction_at": "2026-01-28T15:30:00Z",
      "created_at": "2026-01-01T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 200
  }
}
```

---

### 7.2 Create Customer
**Endpoint:** `POST /customers`  
**Access:** Authenticated

**Request Body:**
```json
{
  "name": "Budi Santoso",
  "phone": "082345678901",
  "email": "budi@example.com",
  "address": "Jl. Merdeka No. 10"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "120e8400-e29b-41d4-a716-446655440041",
    "name": "Budi Santoso",
    "phone": "082345678901",
    "email": "budi@example.com",
    "address": "Jl. Merdeka No. 10",
    "created_at": "2026-01-29T16:00:00Z"
  }
}
```

---

## 8. Suppliers

### 8.1 List Suppliers
**Endpoint:** `GET /suppliers`  
**Access:** Authenticated  
**Description:** Daftar supplier dengan skor AHP.

**Query Parameters:**
- `page`, `per_page`, `search`
- `sort`: string (name, score, rank)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "name": "PT Flour Mills",
      "contact_person": "John",
      "phone": "021-12345678",
      "email": "john@flourmills.com",
      "address": "Jl. Industri No. 5",
      "score": 0.85,
      "rank": 1,
      "criteria_scores": {
        "price": 0.9,
        "quality": 0.8,
        "lead_time": 0.7,
        "reliability": 0.95
      },
      "last_calculated_at": "2026-01-28T00:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 10
  }
}
```

---

### 8.2 Trigger AHP Recalculation
**Endpoint:** `POST /suppliers/recalculate`  
**Access:** Authenticated (admin)  
**Description:** Trigger Python worker untuk hitung ulang skor AHP.

**Request Body:**
```json
{
  "criteria_weights": {
    "price": 0.4,
    "quality": 0.3,
    "lead_time": 0.2,
    "reliability": 0.1
  }
}
```

**Response (202 Accepted):**
```json
{
  "success": true,
  "message": "AHP recalculation queued. Results will be available in 1-2 minutes."
}
```

**Note:** Hasil akan tersimpan di tabel `supplier_scores` dan bisa diambil via `GET /suppliers`.

---

## 9. Analytics & AI

### 9.1 Get RFM Analysis
**Endpoint:** `GET /analytics/rfm`  
**Access:** Authenticated (admin, manajer)  
**Description:** RFM (Recency, Frequency, Monetary) analysis untuk segmentasi pelanggan.

**Query Parameters:**
- `date_from`, `date_to`: date
- `segments`: string (champion, loyal, at_risk, lost) - comma separated

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_customers": 200,
      "segments": {
        "champions": 25,
        "loyal_customers": 45,
        "potential_loyalists": 30,
        "customers_needing_attention": 40,
        "at_risk": 35,
        "cant_lose_them": 15,
        "hibernating": 10
      }
    },
    "customers": [
      {
        "id": "120e8400-e29b-41d4-a716-446655440040",
        "name": "Ahmad",
        "recency_days": 2,
        "frequency": 15,
        "monetary": 2500000,
        "segment": "champions"
      }
    ]
  }
}
```

---

### 9.2 Get Cohort Analysis
**Endpoint:** `GET /analytics/cohort`  
**Access:** Authenticated  
**Description:** Customer retention cohort analysis.

**Query Parameters:**
- `period`: string (monthly, weekly)
- `months`: integer (default: 12)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "cohorts": [
      {
        "cohort_month": "2025-01",
        "total_customers": 50,
        "retention": [
          { "month": 0, "percentage": 100, "customers": 50 },
          { "month": 1, "percentage": 80, "customers": 40 },
          { "month": 2, "percentage": 65, "customers": 32 },
          { "month": 3, "percentage": 55, "customers": 27 }
        ]
      }
    ]
  }
}
```

---

### 9.3 Get Inventory Forecasts
**Endpoint:** `GET /analytics/forecasts`  
**Access:** Authenticated  
**Description:** Prediksi stok dari Prophet model.

**Query Parameters:**
- `product_id`: uuid (optional, filter by product)
- `days`: integer (default: 30, max: 90)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "product_id": "770e8400-e29b-41d4-a716-446655440002",
      "product_name": "Roti Gandum",
      "current_stock": 45,
      "forecast": [
        {
          "date": "2026-01-30",
          "predicted_demand": 18,
          "lower_bound": 12,
          "upper_bound": 24
        },
        {
          "date": "2026-01-31",
          "predicted_demand": 20,
          "lower_bound": 14,
          "upper_bound": 26
        }
      ],
      "stockout_risk": "low",
      "recommended_reorder_date": "2026-02-05",
      "recommended_order_quantity": 100
    }
  ]
}
```

---

### 9.4 Get Supplier Recommendations
**Endpoint:** `GET /analytics/supplier-recommendations`  
**Access:** Authenticated  
**Description:** Rekomendasi supplier berdasarkan AHP scoring.

**Query Parameters:**
- `product_id`: uuid (optional, get recommendation for specific product category)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "product_category": "Bread",
    "recommendations": [
      {
        "rank": 1,
        "supplier": {
          "id": "880e8400-e29b-41d4-a716-446655440003",
          "name": "PT Flour Mills"
        },
        "score": 0.85,
        "criteria_scores": {
          "price": 0.9,
          "quality": 0.8,
          "lead_time": 0.7,
          "reliability": 0.95
        },
        "reason": "Best overall score with excellent reliability and competitive pricing"
      },
      {
        "rank": 2,
        "supplier": {
          "id": "880e8400-e29b-41d4-a716-446655440004",
          "name": "CV Baker Supplies"
        },
        "score": 0.78,
        "criteria_scores": {
          "price": 0.75,
          "quality": 0.85,
          "lead_time": 0.8,
          "reliability": 0.7
        },
        "reason": "Good quality and fast delivery, but slightly higher price"
      }
    ],
    "last_calculated_at": "2026-01-28T00:00:00Z"
  }
}
```

---

## 📊 Status Codes Reference

| Code | Meaning | Usage |
|------|---------|-------|
| `200` | OK | Successful GET, PUT, DELETE |
| `201` | Created | Successful POST (resource created) |
| `202` | Accepted | Async job queued (AI processing) |
| `204` | No Content | Successful DELETE (no response body) |
| `400` | Bad Request | Malformed request |
| `401` | Unauthorized | Missing/invalid token |
| `403` | Forbidden | Valid token but insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Business rule violation (e.g., duplicate SKU) |
| `422` | Unprocessable Entity | Validation failed |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Unexpected error |

---

## 🔐 Permission Matrix

| Role | Products | Services | Rentals | Transactions | Analytics | Suppliers |
|------|----------|----------|---------|--------------|-----------|-----------|
| **Admin** | CRUD | CRUD | CRUD | CRUD | Read | CRUD |
| **Manajer** | CRUD | CRUD | CRUD | Read | Read | Read |
| **Kasir** | Read | Read | Read | Create/Read | ❌ | ❌ |
| **Teknisi** | ❌ | Read (own) | ❌ | Read (own) | ❌ | ❌ |

---

## 📝 Notes & Best Practices

1. **Pagination:** Semua list endpoint menggunakan cursor-based pagination untuk performa optimal.
2. **Eager Loading:** Gunakan query parameter `?include=supplier,forecast` untuk load relasi.
3. **Soft Deletes:** Resource yang dihapus bisa di-restore dalam 30 hari via endpoint `/products/{id}/restore`.
4. **Webhooks:** Untuk integrasi real-time, subscribe ke webhook events di `/webhooks`.
5. **Rate Limiting:** 60 requests/minute untuk authenticated users, 10/minute untuk public.
6. **Idempotency:** POST requests support `Idempotency-Key` header untuk mencegah duplicate transactions.

---

## 🚀 Changelog

### v1.0.0 (2026-01-29)
- Initial release
- Support for 3 business modes: Barang, Jasa, Persewaan
- AI-powered forecasting (Prophet) and supplier scoring (AHP)
- RFM & Cohort analytics