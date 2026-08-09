"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import Link from "next/link";

interface SidebarProps {
  isMobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isMobileOpen, onClose }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const navItems = [
    {
      label: "Overview Analitik",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      label: "Katalog Produk",
      href: "/katalog",
      icon: Package,
    },
    {
      label: "Kasir (POS)",
      href: "/pos",
      icon: ShoppingCart,
    },
    {
      label: "Data Pelanggan",
      href: "/pelanggan",
      icon: Users,
    },
  ];

  return (
    <>
      {/* Latar Belakang Redup (Hanya di Mobile) */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/70 z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Kontainer Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-full flex flex-col transition-all duration-300 ease-in-out md:relative md:h-[calc(100vh-4rem)] md:sticky md:top-16
          ${isMobileOpen ? "translate-x-0 w-64 shadow-xl md:shadow-none" : "-translate-x-full md:translate-x-0"}
          ${!isMobileOpen && isCollapsed ? "md:w-20" : "md:w-64"}
        `}
      >
        {/* Header Khusus Mobile (Menampilkan Tombol Silang) */}
        <div className="flex md:hidden items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <span className="font-bold text-indigo-600 dark:text-indigo-400">POSKY Menu</span>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Menu Navigasi */}
        <div className="flex-1 p-3 flex flex-col gap-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold border-l-4 border-indigo-600 dark:border-indigo-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 ${
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                />
                <span
                  className={`${
                    !isMobileOpen && isCollapsed ? "md:hidden" : "block"
                  } truncate`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Tombol Collapse di Desktop (Sembunyi di Mobile) */}
        <div className="hidden md:flex p-3 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex w-full items-center justify-center p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            aria-label="Toggle Sidebar"
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
