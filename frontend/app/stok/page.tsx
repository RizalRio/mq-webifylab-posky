"use client";

import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  Search,
  Boxes,
  RefreshCw,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  User,
  Package,
  History,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { stockLogsApi, type BackendStockLog } from "@/lib/api/stockLogs";
import { useDebounce } from "@/hooks/useDebounce";
import { AdjustStockModal } from "@/components/stok/AdjustStockModal";

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function StokPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch Stock Logs
  const { data: stockLogsResponse, isLoading, isFetching } = useQuery({
    queryKey: ["stock-logs", debouncedSearch, selectedType],
    queryFn: () =>
      stockLogsApi.getStockLogs({
        search: debouncedSearch,
        type: selectedType !== "ALL" ? (selectedType as "in" | "out" | "adjustment") : undefined,
      }),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const logs = stockLogsResponse?.data || [];
  const totalCount = stockLogsResponse?.meta?.total ?? logs.length;

  const totalIn = logs.filter((l) => l.type === "in").reduce((sum, l) => sum + l.quantity, 0);
  const totalOut = logs.filter((l) => l.type === "out").reduce((sum, l) => sum + l.quantity, 0);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            Riwayat & Mutasi Stok Produk
            {isFetching && !isLoading && (
              <RefreshCw className="h-4 w-4 animate-spin text-indigo-500" />
            )}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Jejak audit otomatis keluar-masuk stok barang (Penjualan, Restock, dan Opname).
          </p>
        </div>
        <Button
          onClick={() => setIsAdjustModalOpen(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-lg shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Penyesuaian Stok Manual
        </Button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Log Mutasi</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 font-tabular tabular-nums">
              {totalCount} <span className="text-xs font-normal text-slate-400">Catatan</span>
            </p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <History className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Stok Masuk (Restock)</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-tabular tabular-nums">
              +{totalIn} <span className="text-xs font-normal text-slate-400">Unit</span>
            </p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <ArrowDownLeft className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Stok Keluar (Penjualan)</p>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 font-tabular tabular-nums">
              -{totalOut} <span className="text-xs font-normal text-slate-400">Unit</span>
            </p>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama produk atau SKU..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
          {[
            { id: "ALL", label: "Semua Mutasi" },
            { id: "in", label: "Stok Masuk" },
            { id: "out", label: "Stok Keluar" },
            { id: "adjustment", label: "Penyesuaian" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-all ${
                selectedType === tab.id
                  ? "bg-indigo-600 text-white shadow-sm font-semibold"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TABEL STOK LOG */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Produk & SKU
                </th>
                <th scope="col" className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Tipe Mutasi
                </th>
                <th scope="col" className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Jumlah Mutasi
                </th>
                <th scope="col" className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Stok Sebelum & Sesudah
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Keterangan / Petugas
                </th>
                <th scope="col" className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Waktu
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-36"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20 mx-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16 mx-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24 mx-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20 ml-auto"></div></td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Boxes className="h-8 w-8 opacity-30" />
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Belum ada riwayat mutasi stok.
                      </p>
                      <p className="text-xs text-slate-400">
                        Mutasi stok akan otomatis tercatat saat penjualan kasir atau penyesuaian stok manual.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const productName = log.product?.name || `Produk ID: ${log.product_id.slice(0, 6)}`;
                  const productSku = log.product?.sku || "-";
                  const userName = log.user?.name || "Sistem";

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {productName}
                        </p>
                        <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                          SKU: {productSku}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold 
                          ${
                            log.type === "in"
                              ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300"
                              : log.type === "out"
                                ? "bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300"
                                : "bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300"
                          }`}
                        >
                          {log.type === "in" ? (
                            <ArrowDownLeft className="h-3 w-3" />
                          ) : log.type === "out" ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <RefreshCw className="h-3 w-3" />
                          )}
                          {log.type === "in"
                            ? "Stok Masuk"
                            : log.type === "out"
                              ? "Stok Keluar"
                              : "Penyesuaian"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-bold font-tabular tabular-nums">
                        <span
                          className={
                            log.type === "in"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : log.type === "out"
                                ? "text-rose-600 dark:text-rose-400"
                                : "text-indigo-600 dark:text-indigo-400"
                          }
                        >
                          {log.type === "in" ? `+${log.quantity}` : log.type === "out" ? `-${log.quantity}` : `${log.quantity}`}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-center text-xs font-tabular tabular-nums text-slate-600 dark:text-slate-300">
                        {log.stock_before} unit → <span className="font-bold text-slate-900 dark:text-slate-100">{log.stock_after} unit</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300">
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          {log.notes || "Mutasi stok"}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                          <User className="h-3 w-3" /> {userName}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-xs text-slate-500 dark:text-slate-400 font-tabular tabular-nums">
                        {formatDate(log.created_at)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL ADJUST STOK */}
      <AdjustStockModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
      />
    </div>
  );
}
