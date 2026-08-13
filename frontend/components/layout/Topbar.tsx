"use client";

import { useState, useEffect } from "react";
import { Bell, Search, User, Menu, LogOut, Sun, Moon, Store, Sparkles, ShoppingBag, Wrench, PackageCheck } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { authApi } from "@/lib/api/auth";
import { useRouter } from "next/navigation";

export function Topbar({ onMenuToggle }: { onMenuToggle: () => void }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Sync initial dark mode state from document root or localStorage
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn("Backend logout warning:", err);
    } finally {
      logout();
      router.push("/login");
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between transition-colors shadow-xs">
      {/* Brand & Store Identity */}
      <div className="flex items-center gap-3 md:w-64 shrink-0">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none rounded-lg"
          aria-label="Toggle Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-bold text-base shadow-sm shadow-indigo-500/30">
            P
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-100">
                POSKY
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="System Online"></span>
            </div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[130px] sm:max-w-none">
              {(user as any)?.tenant?.name || "POSKY Omnichannel Store"}
            </span>
          </div>
        </div>
      </div>

      {/* Center Search Input with Keyboard Shortcut */}
      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="search"
            placeholder="Cari transaksi, produk, atau pelanggan..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 pl-10 pr-12 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 dark:text-slate-500">
            Ctrl K
          </kbd>
        </div>
      </div>

      {/* Actions & Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Quick Mode Pill Badges (Design system 2.2) */}
        <div className="hidden xl:flex items-center gap-1 mr-2 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] font-medium">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-semibold">
            <ShoppingBag className="h-3 w-3" /> Barang
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300 font-semibold">
            <Wrench className="h-3 w-3" /> Jasa
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 font-semibold">
            <PackageCheck className="h-3 w-3" /> Sewa
          </span>
        </div>

        {/* Mobile Search Trigger */}
        <button
          className="md:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleDarkMode}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle Theme"
          className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none rounded-xl p-2.5 transition-all active:scale-95"
        >
          {isDarkMode ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-slate-600" />
          )}
        </button>

        {/* Notifications */}
        <button
          className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none rounded-xl p-2.5 transition-all relative active:scale-95"
          aria-label="Notifikasi"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
        </button>

        <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

        {/* User Account Info Card */}
        <div className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {user?.name || "Developer Admin"}
            </p>
            <span className="inline-block text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.2 rounded uppercase tracking-wider font-mono">
              {user?.role || "ADMIN"}
            </span>
          </div>
          <div className="h-8 w-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs shrink-0 shadow-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
          </div>
        </div>

        {/* Tombol Logout */}
        <button
          onClick={handleLogout}
          title="Keluar dari akun"
          aria-label="Logout"
          className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 focus:outline-none rounded-xl transition-all active:scale-95"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
