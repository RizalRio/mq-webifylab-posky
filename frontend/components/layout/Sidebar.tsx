"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Store,
  Sparkles,
  FileText,
  Boxes,
  Receipt,
  Layers,
  BarChart3,
  Settings,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";

interface SidebarProps {
  isMobileOpen: boolean;
  onClose: () => void;
}

interface SubNavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
}

interface NavItem {
  label: string;
  href?: string;
  icon: any;
  badge?: string;
  children?: SubNavItem[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function Sidebar({ isMobileOpen, onClose }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useAuthStore();

  const roleUpper = (user?.role || "").toString().toUpperCase();
  const isCashier = roleUpper === "KASIR" || roleUpper === "CASHIER";

  // State untuk melacak sub-menu mana yang terbuka
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({
    transaksi: true,
    inventaris: true,
    modul: true,
  });

  const toggleSubMenu = (key: string) => {
    setOpenSubMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const navSections: NavSection[] = [
    {
      title: "RINGKASAN",
      items: [
        {
          label: "Overview Analitik",
          href: "/",
          icon: LayoutDashboard,
          badge: "AI",
        },
        {
          label: "Laporan & Ekspor",
          href: "/laporan",
          icon: FileText,
        },
      ],
    },
    {
      title: "PENJUALAN & TRANSAKSI",
      items: [
        {
          label: "Modul Transaksi",
          icon: ShoppingCart,
          children: [
            {
              label: "Kasir (POS)",
              href: "/pos",
              icon: ShoppingCart,
            },
            {
              label: "Riwayat Transaksi",
              href: "/transaksi",
              icon: FileText,
            },
          ],
        },
      ],
    },
    {
      title: "INVENTARIS & LOGISTIK",
      items: [
        {
          label: "Manajemen Barang",
          icon: Package,
          children: [
            {
              label: "Katalog Produk",
              href: "/katalog",
              icon: Package,
            },
            {
              label: "Riwayat & Mutasi Stok",
              href: "/stok",
              icon: Boxes,
            },
          ],
        },
      ],
    },
    {
      title: "PELANGGAN & RELASI",
      items: [
        {
          label: "Modul Pelanggan",
          icon: Users,
          children: [
            {
              label: "Daftar Pelanggan",
              href: "/pelanggan",
              icon: Users,
            },
            {
              label: "Analitik RFM & Cohort",
              href: "/pelanggan/analitik",
              icon: BarChart3,
              badge: "Insight",
            },
          ],
        },
        {
          label: "Supplier & AHP",
          href: "/supplier",
          icon: Truck,
        },
      ],
    },
    {
      title: "SISTEM & PENGATURAN",
      items: [
        {
          label: "Pengaturan Toko",
          href: "/pengaturan",
          icon: Settings,
        },
      ],
    },
  ];

  // Filter navSections jika user adalah Kasir
  const filteredNavSections = navSections
    .map((section) => {
      if (!isCashier) return section;

      // Kasir hanya melihat POS, Riwayat Transaksi, dan Katalog Produk
      const filteredItems = section.items
        .map((item) => {
          if (!item.children) {
            return item.href === "/pos" || item.href === "/transaksi" || item.href === "/katalog"
              ? item
              : null;
          }
          const validChildren = item.children.filter(
            (c) => c.href === "/pos" || c.href === "/transaksi" || c.href === "/katalog"
          );
          return validChildren.length > 0 ? { ...item, children: validChildren } : null;
        })
        .filter(Boolean) as NavItem[];

      return filteredItems.length > 0 ? { ...section, items: filteredItems } : null;
    })
    .filter(Boolean) as NavSection[];
  useEffect(() => {
    navSections.forEach((section) => {
      section.items.forEach((item) => {
        if (item.children) {
          const hasActiveChild = item.children.some((child) =>
            pathname.startsWith(child.href)
          );
          if (hasActiveChild) {
            const key = item.label.toLowerCase().split(" ")[0];
            setOpenSubMenus((prev) => ({ ...prev, [key]: true }));
          }
        }
      });
    });
  }, [pathname]);

  return (
    <>
      {/* Latar Belakang Redup (Hanya di Mobile) */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Kontainer Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-full flex flex-col transition-all duration-300 ease-in-out md:relative md:h-[calc(100vh-4rem)] md:sticky md:top-16 shadow-xs
          ${isMobileOpen ? "translate-x-0 w-64 shadow-2xl md:shadow-none" : "-translate-x-full md:translate-x-0"}
          ${!isMobileOpen && isCollapsed ? "md:w-20" : "md:w-64"}
        `}
      >
        {/* Header Khusus Mobile */}
        <div className="flex md:hidden items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
              P
            </div>
            <span className="font-bold text-slate-900 dark:text-slate-100">POSKY Navigation</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Menu Navigasi Sub-Sub Grouping */}
        <div className="flex-1 p-3 flex flex-col gap-4 overflow-y-auto">
          {filteredNavSections.map((section) => (
            <div key={section.title} className="flex flex-col gap-1">
              <p
                className={`px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase ${
                  !isMobileOpen && isCollapsed ? "md:hidden" : "block"
                }`}
              >
                {section.title}
              </p>

              {section.items.map((item) => {
                const Icon = item.icon;
                const menuKey = item.label.toLowerCase().split(" ")[0];
                const isOpen = openSubMenus[menuKey] ?? false;

                // Cek jika item tunggal tanpa anak
                if (!item.children && item.href) {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                        isActive
                          ? "bg-indigo-600 dark:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-500/25 dark:shadow-indigo-500/15"
                          : "text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 shrink-0 transition-transform group-hover:scale-105 ${
                          isActive
                            ? "text-white"
                            : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                        }`}
                      />
                      <span
                        className={`${
                          !isMobileOpen && isCollapsed ? "md:hidden" : "block"
                        } truncate flex-1`}
                      >
                        {item.label}
                      </span>

                      {item.badge && (
                        <span
                          className={`hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isActive
                              ? "bg-white/20 text-white border border-white/20"
                              : "bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80"
                          } ${
                            !isMobileOpen && isCollapsed ? "md:hidden" : "block"
                          }`}
                        >
                          <Sparkles className={`h-2.5 w-2.5 ${isActive ? "text-white" : "text-indigo-500"}`} />
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                }

                // Cek jika item memiliki sub-menu (children)
                const isAnyChildActive = item.children?.some((child) =>
                  pathname.startsWith(child.href)
                );

                return (
                  <div key={item.label} className="flex flex-col gap-1">
                    {/* Header Sub-Group Parent */}
                    <button
                      onClick={() => toggleSubMenu(menuKey)}
                      className={`w-full group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        isAnyChildActive
                          ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className="h-5 w-5 shrink-0 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                        <span
                          className={`${
                            !isMobileOpen && isCollapsed ? "md:hidden" : "block"
                          } truncate`}
                        >
                          {item.label}
                        </span>
                      </div>
                      {(!isCollapsed || isMobileOpen) && (
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 transition-transform duration-200 text-slate-400 ${
                            isOpen ? "rotate-180 text-indigo-600 dark:text-indigo-400" : ""
                          }`}
                        />
                      )}
                    </button>

                    {/* Sub-Items Accordion Children */}
                    {isOpen && (!isCollapsed || isMobileOpen) && (
                      <div className="ml-4 pl-3 border-l-2 border-slate-200 dark:border-slate-800 flex flex-col gap-1 my-0.5 animate-in slide-in-from-top-1 duration-200">
                        {item.children?.map((child) => {
                          const ChildIcon = child.icon;
                          const isChildActive =
                            child.href === "/pelanggan"
                              ? pathname === "/pelanggan" || (pathname.startsWith("/pelanggan/") && !pathname.startsWith("/pelanggan/analitik"))
                              : pathname.startsWith(child.href);

                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                isChildActive
                                  ? "bg-indigo-600 text-white font-semibold shadow-xs"
                                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200"
                              }`}
                            >
                              <ChildIcon
                                className={`h-4 w-4 shrink-0 ${
                                  isChildActive ? "text-white" : "text-slate-400 dark:text-slate-500"
                                }`}
                              />
                              <span className="truncate flex-1">{child.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer Tenant Info Card & Collapse Toggle */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
          {/* Tenant Info Card */}
          <div
            className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 ${
              !isMobileOpen && isCollapsed ? "md:hidden" : "flex"
            }`}
          >
            <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Store className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                {(user as any)?.tenant?.name || "POSKY Omnichannel Store"}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                  {(user as any)?.tenant?.subdomain ? `${(user as any).tenant.subdomain}.posky.com` : "demo.posky.com"}
                </span>
              </div>
            </div>
          </div>

          {/* Tombol Collapse di Desktop */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex w-full items-center justify-center p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
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

