"use client";

import { Plus, Search, Edit, Trash2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";
import { useState } from "react";
import { AddProductModal } from "@/components/katalog/AddProductModal";

// Data tiruan sementara
const CATALOG_DATA: Product[] = [
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
    id: "BRD-002",
    sku: "BRD-002",
    name: "Kopi Susu Literan Special",
    mode: "BARANG",
    price: 35000,
    stock: 8,
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
    id: "BRD-003",
    sku: "BRD-003",
    name: "Gula Pasir 1kg",
    mode: "BARANG",
    price: 16000,
    stock: 0,
    isAvailable: false,
  },
];

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
};

export default function KatalogPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* HEADER & AKSI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Katalog Produk
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Kelola inventori barang, layanan jasa, dan aset sewaan.
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

      {/* TOOLBAR (Pencarian & Filter) */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Cari nama atau SKU..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
          />
        </div>
        <Button
          variant="outline"
          className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <Filter className="h-4 w-4" />
          Filter Mode
        </Button>
      </div>

      {/* TABEL DATA */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                >
                  SKU
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
                  Stok
                </th>
                <th
                  scope="col"
                  className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                >
                  Status
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
              {CATALOG_DATA.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold font-mono text-slate-900 dark:text-slate-100">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-200">
                    {product.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold 
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
                          : "📦 "}{" "}
                      {product.mode}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-right font-bold text-slate-900 dark:text-slate-100 font-tabular tabular-nums">
                    {formatRupiah(product.price)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-right text-slate-600 dark:text-slate-300 font-tabular tabular-nums font-medium">
                    {product.stock > 0 ? product.stock : "-"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    {product.stock > 10 ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        Tersedia
                      </span>
                    ) : product.stock > 0 ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                        Menipis
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 dark:bg-rose-950/60 px-2.5 py-0.5 text-xs font-medium text-rose-700 dark:text-rose-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                        Habis
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors"
                        title="Edit Produk"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                        title="Hapus Produk"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINASI */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3.5">
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Menampilkan <span className="font-semibold text-slate-900 dark:text-slate-100 font-tabular tabular-nums">1</span>{" "}
            sampai <span className="font-semibold text-slate-900 dark:text-slate-100 font-tabular tabular-nums">5</span> dari{" "}
            <span className="font-semibold text-slate-900 dark:text-slate-100 font-tabular tabular-nums">120</span> hasil
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled className="text-xs dark:bg-slate-800 dark:border-slate-700">
              Sebelumnya
            </Button>
            <Button variant="outline" size="sm" className="text-xs dark:bg-slate-800 dark:border-slate-700">
              Selanjutnya
            </Button>
          </div>
        </div>
      </div>
      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
