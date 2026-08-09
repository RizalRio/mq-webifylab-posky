"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Topbar } from "./Topbar";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Cek apakah ini halaman autentikasi
  const isAuthPage = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Jika ini halaman Login, JANGAN tampilkan Topbar & Sidebar
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
