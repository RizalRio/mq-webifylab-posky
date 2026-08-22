"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Topbar } from "./Topbar";
import { Sidebar } from "./Sidebar";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();

  // Cek apakah ini halaman autentikasi atau landing page
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isLandingPage = pathname === "/";

  // Route Protection Logic
  useEffect(() => {
    setIsMobileMenuOpen(false);

    if (user && !isAuthPage && !isLandingPage) {
      const role = (user.role || "").toLowerCase();
      
      // Aturan Kasir
      if (role === "kasir") {
        const kasirAllowedRoutes = ["/pos", "/transaksi", "/katalog", "/stok", "/pelanggan"];
        const isAllowed = kasirAllowedRoutes.some(r => pathname === r || pathname.startsWith(r + "/"));
        if (!isAllowed) {
          toast.error("Akses Ditolak. Kasir tidak memiliki akses ke halaman ini.");
          router.replace("/pos");
        }
      }

      // Aturan Manajer
      if (role === "manajer") {
        if (pathname.startsWith("/pos") || pathname.startsWith("/user")) {
          toast.error("Akses Ditolak. Manajer tidak memiliki akses ke halaman ini.");
          router.replace("/dashboard");
        }
      }

      // Aturan Pengaturan Pengguna (Hanya Admin)
      if (role !== "admin" && pathname.startsWith("/user")) {
        toast.error("Akses Ditolak. Hanya Admin yang dapat mengelola karyawan.");
        router.replace("/dashboard");
      }
    }
  }, [pathname, user, router, isAuthPage, isLandingPage]);

  // Jika ini halaman Landing Page, tampilkan tanpa padding dan flex centering
  if (isLandingPage) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors">
        {children}
      </div>
    );
  }

  // Jika ini halaman Login, JANGAN tampilkan Topbar & Sidebar (tapi beri centering)
  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors">
        {children}
      </div>
    );
  }

  // Jika halaman biasa (Dasbor, dll), tampilkan tata letak utuh
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <Topbar onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      <div className="flex">
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
        <main className="flex-1 min-w-0 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
