"use client";

import { useState } from "react";
import { Plus, Search, Edit, Trash2, Filter, Loader2, Package, Layers, ShoppingBag, Wrench, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { productsApi } from "@/lib/api/products";
import { AddProductModal } from "@/components/katalog/AddProductModal";
import { EditProductModal } from "@/components/katalog/EditProductModal";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import type { BusinessMode } from "@/types";

export interface UnifiedCatalogItem {
  id: string;
  sku: string;
  name: string;
  mode: BusinessMode;
  category?: string;
  price: number;
  cost_price?: number;
  stock: number;
  min_stock_threshold?: number;
  duration_minutes?: number;
  description?: string;
  deposit_amount?: number;
  status?: "available" | "rented" | "maintenance";
  rawType: "product" | "service" | "rental";
}

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
};

export default function KatalogPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UnifiedCatalogItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMode, setSelectedMode] = useState<string>("ALL");

  // Debounce kata kunci pencarian (300ms) untuk mencegah spam API request ke backend
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch Products (BARANG) dengan caching & keepPreviousData
  const { data: productsData, isLoading: isLoadingProducts, isFetching: isFetchingProducts } = useQuery({
    queryKey: ["products", debouncedSearch],
    queryFn: () => productsApi.getProducts({ search: debouncedSearch }),
    enabled: selectedMode === "ALL" || selectedMode === "BARANG",
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Fetch Services (JASA)
  const { data: servicesData, isLoading: isLoadingServices, isFetching: isFetchingServices } = useQuery({
    queryKey: ["services", debouncedSearch],
    queryFn: () => productsApi.getServices({ search: debouncedSearch }),
    enabled: selectedMode === "ALL" || selectedMode === "JASA",
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Fetch Rental Items (SEWA)
  const { data: rentalsData, isLoading: isLoadingRentals, isFetching: isFetchingRentals } = useQuery({
    queryKey: ["rental-items", debouncedSearch],
    queryFn: () => productsApi.getRentalItems({ search: debouncedSearch }),
    enabled: selectedMode === "ALL" || selectedMode === "SEWA",
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async ({ id, name, rawType }: { id: string; name: string; rawType: "product" | "service" | "rental" }) => {
      if (rawType === "product") {
        await productsApi.deleteProduct(id);
      } else if (rawType === "service") {
        await productsApi.deleteService(id);
      } else {
        await productsApi.deleteRentalItem(id);
      }
      return name;
    },
    onSuccess: (deletedName) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["rental-items"] });
      toast.success(`Item "${deletedName}" berhasil dihapus!`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Gagal menghapus item dari backend.";
      toast.error(msg);
    },
  });

  // Convert & Combine API Data
  const unifiedItems: UnifiedCatalogItem[] = [];

  if ((selectedMode === "ALL" || selectedMode === "BARANG") && productsData?.data) {
    productsData.data.forEach((p) => {
      unifiedItems.push({
        id: p.id,
        sku: p.sku,
        name: p.name,
        mode: "BARANG",
        category: p.category || "",
        price: Number(p.sell_price),
        cost_price: Number(p.cost_price),
        stock: p.stock,
        min_stock_threshold: p.min_stock_threshold ?? 5,
        rawType: "product",
      });
    });
  }

  if ((selectedMode === "ALL" || selectedMode === "JASA") && servicesData?.data) {
    servicesData.data.forEach((s) => {
      unifiedItems.push({
        id: s.id,
        sku: "-",
        name: s.name,
        mode: "JASA",
        price: Number(s.price),
        duration_minutes: s.duration_minutes ? Number(s.duration_minutes) : 60,
        description: s.description || "",
        stock: 99,
        rawType: "service",
      });
    });
  }

  if ((selectedMode === "ALL" || selectedMode === "SEWA") && rentalsData?.data) {
    rentalsData.data.forEach((r) => {
      unifiedItems.push({
        id: r.id,
        sku: r.serial_number,
        name: r.name,
        mode: "SEWA",
        category: r.category || "",
        price: Number(r.daily_rate),
        deposit_amount: Number(r.deposit_amount),
        status: r.status,
        stock: r.status === "available" ? 1 : 0,
        rawType: "rental",
      });
    });
  }

  const isLoading = isLoadingProducts || isLoadingServices || isLoadingRentals;
  const isFetchingAny = isFetchingProducts || isFetchingServices || isFetchingRentals;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* HEADER & AKSI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Katalog Produk & Layanan
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Kelola inventori barang, layanan jasa, dan aset sewaan terintegrasi ke backend.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-lg shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Tambah Produk
        </Button>
      </div>

      {/* TOOLBAR (Pencarian & Filter Mode) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau SKU produk..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-10 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
          />
          {isFetchingAny && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-indigo-600 dark:text-indigo-400" />
          )}
        </div>

        {/* Mode Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar shrink-0">
          <button
            onClick={() => setSelectedMode("ALL")}
            className={`whitespace-nowrap inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
              selectedMode === "ALL"
                ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <Layers className="h-3.5 w-3.5" /> Semua
          </button>
          <button
            onClick={() => setSelectedMode("BARANG")}
            className={`whitespace-nowrap inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
              selectedMode === "BARANG"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-200 dark:hover:bg-blue-900/60"
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5" /> Barang
          </button>
          <button
            onClick={() => setSelectedMode("JASA")}
            className={`whitespace-nowrap inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
              selectedMode === "JASA"
                ? "bg-violet-600 text-white shadow-sm"
                : "bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/60 hover:bg-violet-200 dark:hover:bg-violet-900/60"
            }`}
          >
            <Wrench className="h-3.5 w-3.5" /> Jasa
          </button>
          <button
            onClick={() => setSelectedMode("SEWA")}
            className={`whitespace-nowrap inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
              selectedMode === "SEWA"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-200 dark:hover:bg-amber-900/60"
            }`}
          >
            <PackageCheck className="h-3.5 w-3.5" /> Sewa
          </button>
        </div>
      </div>

      {/* TABEL DATA HASIL FETCH BACKEND */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                >
                  SKU / Seri
                </th>
                <th
                  scope="col"
                  className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                >
                  Nama Produk
                </th>
                <th
                  scope="col"
                  className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                >
                  Mode Bisnis
                </th>
                <th
                  scope="col"
                  className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                >
                  Harga Jual
                </th>
                <th
                  scope="col"
                  className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                >
                  Stok / Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                >
                  Ketersediaan
                </th>
                <th
                  scope="col"
                  className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {isLoading ? (
                /* Skeleton Loading Table Rows */
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-44 bg-slate-200 dark:bg-slate-800 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded ml-auto"></div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded ml-auto"></div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto"></div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="h-6 w-8 bg-slate-200 dark:bg-slate-800 rounded ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : unifiedItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package className="h-8 w-8 opacity-30" />
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Tidak ada produk ditemukan.</p>
                      <p className="text-xs text-slate-400">Gunakan tombol "Tambah Produk" untuk membuat data baru.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                unifiedItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold font-mono text-slate-900 dark:text-slate-100">
                      {item.sku}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-200">
                      {item.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold 
                        ${
                          item.mode === "BARANG"
                            ? "bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300"
                            : item.mode === "JASA"
                              ? "bg-violet-100 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300"
                              : "bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300"
                        }`}
                      >
                        {item.mode === "BARANG" ? (
                          <ShoppingBag className="h-3 w-3" />
                        ) : item.mode === "JASA" ? (
                          <Wrench className="h-3 w-3" />
                        ) : (
                          <PackageCheck className="h-3 w-3" />
                        )}
                        {item.mode}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-right font-bold text-slate-900 dark:text-slate-100 font-tabular tabular-nums">
                      {formatRupiah(item.price)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-right text-slate-600 dark:text-slate-300 font-tabular tabular-nums font-medium">
                      {item.mode === "JASA" ? "Layanan" : item.mode === "SEWA" ? "1 Unit Aset" : `${item.stock} unit`}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      {item.mode === "SEWA" ? (
                        item.status === "available" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            Tersedia
                          </span>
                        ) : item.status === "rented" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-blue-950/60 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                            Sedang Disewa
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                            Perawatan
                          </span>
                        )
                      ) : item.mode === "JASA" || item.stock > (item.min_stock_threshold ?? 5) ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                          Tersedia
                        </span>
                      ) : item.stock > 0 ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                          Stok Menipis
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 dark:bg-rose-950/60 px-2.5 py-0.5 text-xs font-medium text-rose-700 dark:text-rose-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                          Stok Habis
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors"
                          title="Edit Produk"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Apakah Anda yakin ingin menghapus "${item.name}"?`)) {
                              deleteMutation.mutate({ id: item.id, name: item.name, rawType: item.rawType });
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors disabled:opacity-50"
                          title="Hapus Produk"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER INFORMASI TOTAL */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3.5">
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Total katalog terdaftar: <span className="font-semibold text-slate-900 dark:text-slate-100 font-tabular tabular-nums">{unifiedItems.length}</span> item
          </p>
        </div>
      </div>

      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <EditProductModal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        item={editingItem}
      />
    </div>
  );
}
