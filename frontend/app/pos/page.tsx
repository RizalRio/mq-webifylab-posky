"use client";

import { useState } from "react";
import { Search, ShoppingCart, Trash2, Tag, Layers, ShoppingBag, Wrench, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import type { Product } from "@/types";

const DUMMY_PRODUCTS: Product[] = [
  {
    id: "BRD-001",
    sku: "BRD-001",
    name: "Roti Gandum Utuh Premium",
    mode: "BARANG",
    price: 12000,
    stock: 45,
    isAvailable: true,
  },
  {
    id: "SRV-012",
    sku: "SRV-012",
    name: "Servis Ringan Mesin",
    mode: "JASA",
    price: 150000,
    stock: 99,
    isAvailable: true,
  },
  {
    id: "RNT-045",
    sku: "RNT-045",
    name: "Sewa Proyektor Epson XGA",
    mode: "SEWA",
    price: 75000,
    stock: 5,
    isAvailable: true,
  },
  {
    id: "BRD-002",
    sku: "BRD-002",
    name: "Kopi Susu Literan Special",
    mode: "BARANG",
    price: 35000,
    stock: 18,
    isAvailable: true,
  },
];

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
};

export default function POSPage() {
  const { items, subtotal, tax, total, addItem, removeItem, clearCart } =
    useCartStore();
  const [selectedMode, setSelectedMode] = useState<string>("ALL");

  const filteredProducts =
    selectedMode === "ALL"
      ? DUMMY_PRODUCTS
      : DUMMY_PRODUCTS.filter((p) => p.mode === selectedMode);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-6rem)] animate-in fade-in duration-300">
      {/* Left Panel: Search, Mode Tabs, and Product Grid */}
      <div className="w-full lg:flex-1 flex flex-col gap-4 lg:gap-6 h-1/2 lg:h-full overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 lg:gap-4 shrink-0">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Cari nama atau SKU produk..."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
            />
          </div>

          {/* Mode Tabs Color-Coded Per docs/design.md ⭐ */}
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
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => addItem(product)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 lg:p-4 shadow-card hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-500 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold 
                    ${
                      product.mode === "BARANG"
                        ? "bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300"
                        : product.mode === "JASA"
                          ? "bg-violet-100 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300"
                          : "bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300"
                    }`}
                  >
                    {product.mode === "BARANG"
                      ? "🛒 "
                      : product.mode === "JASA"
                        ? "🛠️ "
                        : "📦 "}
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
                  Stok:{" "}
                  <span className="font-semibold text-slate-700 dark:text-slate-300 font-tabular tabular-nums">
                    {product.stock}
                  </span>
                </p>
              </div>
            </div>
          ))}
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
                Pilih produk di sebelah kiri untuk mulai transaksi.
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
                      {formatRupiah(item.price)}{" "}
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        x {item.quantity}
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 font-tabular tabular-nums">
                      {formatRupiah(item.subtotal)}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
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
            className="w-full h-12 text-base font-semibold mt-2 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-xl shadow-sm transition-all"
          >
            Bayar {items.length > 0 ? formatRupiah(total) : "Sekarang"}
          </Button>
        </div>
      </div>
    </div>
  );
}
