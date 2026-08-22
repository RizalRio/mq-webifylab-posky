import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // 0. Force logout handler
  if (request.nextUrl.searchParams.get("clear_session") === "true") {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    return response;
  }

  // 1. Ambil token dari Cookies yang dikirimkan oleh browser
  const token = request.cookies.get("token")?.value;

  // 2. Cek apakah pengguna sedang berada di halaman Autentikasi atau Landing Page
  const isAuthPage = request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/register");
  const isLandingPage = request.nextUrl.pathname === "/";

  // ATURAN 1: Belum login tapi mencoba mengakses halaman dalam (Dasbor, POS, dll)
  if (!token && !isAuthPage && !isLandingPage) {
    // Tendang kembali ke halaman Login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ATURAN 2: Sudah login tapi mencoba mengakses halaman Login atau Landing Page
  if (token && (isAuthPage || isLandingPage)) {
    // Arahkan ke Dasbor
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Jika aman, biarkan lewat
  return NextResponse.next();
}

// 3. Konfigurasi rute mana saja yang akan dipantau oleh Middleware ini
export const config = {
  matcher: [
    /*
     * Pantau semua rute KECUALI:
     * - api/ (Rute API internal jika ada)
     * - _next/static (File CSS/JS)
     * - _next/image (File gambar)
     * - favicon.ico
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
