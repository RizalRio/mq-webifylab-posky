# ADR 0007: Local Development Environment (Native Stack, No Docker)

## Status
Accepted

## Context
Untuk fase development, kita memutuskan **TIDAK menggunakan Docker** (berbeda dengan production). Developer akan menjalankan semua service secara native di mesin lokal (Linux/WSL2).

Tantangan:
- Perlu menjalankan 5 service berbeda: PHP-FPM, Nginx, Node.js (Next.js), PostgreSQL, Redis, Python.
- Versi dependency harus konsisten antar developer (jika ada tim).
- Setup awal tidak boleh memakan waktu > 1 jam.

Ada 3 opsi:
1. **Docker Desktop:** Konsisten tapi berat & butuh resource besar.
2. **Native Stack (manual install):** Ringan tapi setup ribet & rentan "works on my machine".
3. **Native Stack + Version Manager:** Ringan, konsisten, mudah setup.

## Decision
Kita memilih **Opsi 3: Native Stack dengan Version Manager** menggunakan:
- **PHP:** `phpbrew` atau Ondřej Surý PPA (Ubuntu) untuk PHP 8.3
- **Node.js:** `nvm` (Node Version Manager) untuk Node 20 LTS
- **Python:** `pyenv` untuk Python 3.10+
- **PostgreSQL:** Native install via package manager
- **Redis:** Native install via package manager
- **Web Server:** Laravel built-in server (`php artisan serve`) untuk dev, Nginx hanya untuk production

## Consequences

**Positif (+):**
- **Performance:** Native execution lebih cepat daripada containerized (no virtualization overhead).
- **Resource Efficiency:** Tidak perlu alokasi RAM untuk Docker VM (bisa jalan di laptop 8GB RAM).
- **Debugging:** Lebih mudah debug dengan IDE (PHPStorm, VSCode) tanpa setup remote interpreter.
- **Faster Iteration:** File changes langsung terdeteksi tanpa volume mount issues.
- **Simpler Stack:** Tidak perlu belajar Docker Compose untuk developer baru.

**Negatif (-):**
- **Environment Drift:** Versi dependency bisa berbeda antar developer.
- **Setup Time:** Developer baru butuh 30-60 menit untuk setup awal.
- **OS-specific:** Setup berbeda antara Linux, macOS, dan Windows (WSL2).
- **Production Parity:** "Works on my machine" bisa jadi masalah saat deploy.

**Mitigasi:**
- Buat file `docs/SETUP.md` dengan instruksi detail per-OS.
- Gunakan `.nvmrc`, `.python-version`, dan `.php-version` untuk lock versi.
- Buat script `setup.sh` untuk otomatisasi instalasi dependency.
- Untuk testing production-like environment, gunakan VPS staging (bukan Docker lokal).
- Dokumentasi versi exact yang dipakai (misal: PHP 8.3.6, Node 20.12.0, Python 3.10.12).