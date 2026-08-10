"use client";

import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  Search,
  ShoppingCart,
  Trash2,
  Layers,
  ShoppingBag,
  Wrench,
  PackageCheck,
  Plus,
  Minus,
  RefreshCw,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { productsApi } from "@/lib/api/products";
import { useDebounce } from "@/hooks/useDebounce";
import { CheckoutModal } from "@/components/pos/CheckoutModal";
import type { BusinessMode } from "@/types";

export interface UnifiedPosItem {
  id: string;
  sku: string;
  name: string;
  mode: BusinessMode;
  price: number;
  stock: number;
  isAvailable: boolean;
  rawType: "product" | "service" | "rental";
}

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
};

export default function POSPage() {
  const { items, subtotal, tax, total, addItem, updateQuantity, removeItem, clearCart } =
    useCartStore();
  const [selectedMode, setSelectedMode] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // 1. Query Products (BARANG)
  const { data: productsData, isLoading: isLoadingProducts, isFetching: isFetchingProducts } = useQuery({
    queryKey: ["products", debouncedSearch],
    queryFn: () => productsApi.getProducts({ search: debouncedSearch }),
    enabled: selectedMode === "ALL" || selectedMode === "BARANG",
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // 2. Query Services (JASA)
  const { data: servicesData, isLoading: isLoadingServices, isFetching: isFetchingServices } = useQuery({
    queryKey: ["services", debouncedSearch],
    queryFn: () => productsApi.getServices({ search: debouncedSearch }),
    enabled: selectedMode === "ALL" || selectedMode === "JASA",
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // 3. Query Rental Items (SEWA)
  const { data: rentalsData, isLoading: isLoadingRentals, isFetching: isFetchingRentals } = useQuery({
    queryKey: ["rental-items", debouncedSearch],
    queryFn: () => productsApi.getRentalItems({ search: debouncedSearch }),
    enabled: selectedMode === "ALL" || selectedMode === "SEWA",
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const isLoading = isLoadingProducts || isLoadingServices || isLoadingRentals;
  const isFetching = isFetchingProducts || isFetchingServices || isFetchingRentals;

  // Combine items into unified array
  const catalogItems: UnifiedPosItem[] = [];

  if ((selectedMode === "ALL" || selectedMode === "BARANG") && productsData?.data) {
    productsData.data.forEach((p) => {
      catalogItems.push({
        id: p.id,
        sku: p.sku,
        name: p.name,
        mode: "BARANG",
        price: Number(p.sell_price),
        stock: p.stock,
        isAvailable: p.stock > 0,
        rawType: "product",
      });
    });
  }

  if ((selectedMode === "ALL" || selectedMode === "JASA") && servicesData?.data) {
    servicesData.data.forEach((s) => {
      catalogItems.push({
        id: s.id,
        sku: "-",
        name: s.name,
        mode: "JASA",
        price: Number(s.price),
        stock: 99,
        isAvailable: true,
        rawType: "service",
      });
    });
  }

  if ((selectedMode === "ALL" || selectedMode === "SEWA") && rentalsData?.data) {
    rentalsData.data.forEach((r) => {
      catalogItems.push({
        id: r.id,
        sku: r.serial_number,
        name: r.name,
        mode: "SEWA",
        price: Number(r.daily_rate),
        stock: r.status === "available" ? 1 : 0,
        isAvailable: r.status === "available",
        rawType: "rental",
      });
    });
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-6rem)] animate-in fade-in duration-300">
      {/* Left Panel: Search, Mode Tabs, and Product Grid */}
      <div className="w-full lg:flex-1 flex flex-col gap-4 lg:gap-6 h-1/2 lg:h-full overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 lg:gap-4 shrink-0">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau SKU produk..."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
            />
            {isFetching && !isLoading && (
              <RefreshCw className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-indigo-500" />
            )}
          </div>

          {/* Mode Tabs Color-Coded */}
          <div className="flex w-full sm:w-auto gap-2 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar shrink-0">
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

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4 overflow-y-auto pb-4 pr-1 lg:pr-2">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 animate-pulse h-36 flex flex-col justify-between">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24 mb-2"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32"></div>
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-20 mt-4"></div>
              </div>
            ))
          ) : catalogItems.length === 0 ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center text-slate-400">
              <Package className="h-10 w-10 opacity-30 mb-2" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Tidak ada item ditemukan di katalog.</p>
              <p className="text-xs text-slate-400">Tambahkan barang, jasa, atau item sewa terlebih dahulu.</p>
            </div>
          ) : (
            catalogItems.map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  if (product.isAvailable) {
                    addItem({
                      id: product.id,
                      sku: product.sku,
                      name: product.name,
                      mode: product.mode,
                      price: product.price,
                      stock: product.stock,
                      rawType: product.rawType,
                    });
                  }
                }}
                className={`rounded-xl border bg-white dark:bg-slate-900 p-3.5 lg:p-4 shadow-card transition-all flex flex-col justify-between ${
                  product.isAvailable
                    ? "border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-500 cursor-pointer group"
                    : "border-slate-100 dark:border-slate-800/40 opacity-60 cursor-not-allowed"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold 
                      ${
                        product.mode === "BARANG"
                          ? "bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300"
                          : product.mode === "JASA"
                            ? "bg-violet-100 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300"
                            : "bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300"
                      }`}
                    >
                      {product.mode === "BARANG" ? (
                        <ShoppingBag className="h-2.5 w-2.5" />
                      ) : product.mode === "JASA" ? (
                        <Wrench className="h-2.5 w-2.5" />
                      ) : (
                        <PackageCheck className="h-2.5 w-2.5" />
                      )}
                      {product.mode}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                      {product.sku}
                    </span>
                  </div>
                  <h3 className="text-xs lg:text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {product.name}
                  </h3>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                  <p className="text-base lg:text-lg font-bold text-indigo-600 dark:text-indigo-400 font-tabular tabular-nums">
                    {formatRupiah(product.price)}
                  </p>
                  <p className="mt-0.5 text-[10px] lg:text-xs text-slate-500 dark:text-slate-400">
                    Status:{" "}
                    <span className={`font-semibold font-tabular tabular-nums ${product.isAvailable ? "text-slate-700 dark:text-slate-300" : "text-rose-500"}`}>
                      {product.mode === "JASA" ? "Ready" : product.mode === "SEWA" ? (product.isAvailable ? "Tersedia" : "Disewa") : `${product.stock} unit`}
                    </span>
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Sticky Cart Panel (w-96) */}
      <div className="w-full lg:w-96 h-1/2 lg:h-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card flex flex-col shrink-0 overflow-hidden">
        <div className="p-3.5 lg:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 lg:h-5 lg:w-5 text-slate-700 dark:text-slate-300" />
            <h2 className="text-sm lg:text-base font-semibold text-slate-900 dark:text-slate-100">
              Keranjang{" "}
              <span className="text-slate-400 dark:text-slate-500 font-normal font-tabular tabular-nums">
                ({items.length})
              </span>
            </h2>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-[10px] lg:text-xs font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors"
            >
              Kosongkan
            </button>
          )}
        </div>

        {/* Dynamic Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 dark:text-slate-600 space-y-3">
              <ShoppingCart className="h-10 w-10 opacity-20" />
              <p className="text-xs lg:text-sm">
                Keranjang masih kosong.
                <br />
                Pilih item produk di sebelah kiri untuk transaksi.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs lg:text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {item.name}
                    </p>
                    <p className="text-[10px] lg:text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-tabular tabular-nums">
                      {formatRupiah(item.price)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 font-tabular tabular-nums">
                      {formatRupiah(item.subtotal)}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-semibold font-tabular tabular-nums px-1 text-slate-900 dark:text-slate-100">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors ml-1"
                        title="Hapus"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Calculations & Payment CTA Button */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 space-y-2.5 shrink-0">
          <div className="flex items-center justify-between text-xs lg:text-sm text-slate-600 dark:text-slate-400">
            <span>Subtotal</span>
            <span className="font-tabular tabular-nums font-semibold text-slate-900 dark:text-slate-100">
              {formatRupiah(subtotal)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs lg:text-sm text-slate-600 dark:text-slate-400">
            <span>Pajak (PPN 11%)</span>
            <span className="font-tabular tabular-nums font-semibold text-slate-900 dark:text-slate-100">
              {formatRupiah(tax)}
            </span>
          </div>
          <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-sm lg:text-base font-bold text-slate-900 dark:text-slate-100">
              Total
            </span>
            <span className="text-lg lg:text-xl font-bold text-indigo-600 dark:text-indigo-400 font-tabular tabular-nums">
              {formatRupiah(total)}
            </span>
          </div>

          <Button
            disabled={items.length === 0}
            onClick={() => setIsCheckoutOpen(true)}
            className="w-full h-12 text-base font-semibold mt-2 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-xl shadow-sm transition-all"
          >
            Bayar {items.length > 0 ? formatRupiah(total) : "Sekarang"}
          </Button>
        </div>
      </div>

      {/* CHECKOUT MODAL */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </div>
  );
}
