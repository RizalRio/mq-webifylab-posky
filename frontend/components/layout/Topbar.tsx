"use client";

import { useState, useEffect } from "react";
import { Bell, Search, User, Menu, LogOut, Sun, Moon } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
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

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3 md:gap-4 md:w-56 shrink-0">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none rounded-lg"
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">
            POSKY
          </h1>
          <span className="hidden md:inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            HQ
          </span>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="hidden md:flex flex-1 items-center justify-center px-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="search"
            placeholder="Cari transaksi, produk..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
          />
        </div>
      </div>

      {/* Actions & Profile */}
      <div className="flex items-center gap-1 md:gap-2 shrink-0">
        <button
          className="md:hidden p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-full"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleDarkMode}
          title={isDarkMode ? "Mode Terang" : "Mode Gelap"}
          aria-label="Toggle Theme"
          className="text-slate-400 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none rounded-lg p-2 transition-colors"
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5 text-amber-400" />
          ) : (
            <Moon className="h-5 w-5 text-slate-600" />
          )}
        </button>

        <button
          className="text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none rounded-lg p-2 transition-colors relative"
          aria-label="Notifikasi"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500" />
        </button>

        <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1 md:mx-2 hidden sm:block"></div>

        <div className="flex items-center gap-2 md:gap-3 p-1 pl-2 rounded-lg text-left">
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-none">
              {user?.name || "Admin Kasir"}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase font-mono">
              {user?.role || "ADMINISTRATOR"}
            </p>
          </div>
          <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <User className="h-4 w-4" />
          </div>
        </div>

        {/* Tombol Logout */}
        <button
          onClick={handleLogout}
          title="Keluar dari sistem"
          aria-label="Logout"
          className="ml-1 p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 focus:outline-none rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
