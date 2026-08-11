"use client";

import {
  ArrowUpRight,
  ArrowDownRight,
  Package,
  TrendingUp,
  Users,
  Calendar,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getDashboardMetrics } from "@/lib/api/analytics";
import { ProphetChart } from "@/components/dashboard/ProphetChart";

export default function DashboardPage() {
  const { data: metrics, isLoading, isError } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: getDashboardMetrics,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* HEADER HALAMAN */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            Overview Analitik
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              <Sparkles className="h-3 w-3" /> AI Active
            </span>
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Pantau performa transaksi dan prediksi AI Prophet & AHP hari ini.
          </p>
        </div>

        {/* Tombol Date Picker (Mockup) */}
        <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-card transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
          <Calendar className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          Bulan Ini
        </button>
      </div>

      {/* KARTU STATISTIK (Grid 4 Kolom) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Stat 1: Pendapatan */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card transition-all hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Pendapatan
            </p>
            <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100 font-tabular tabular-nums">
            {isLoading ? "..." : formatCurrency(metrics?.revenue.total || 0)}
          </p>
          <div className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            {metrics?.revenue?.growth && metrics.revenue.growth >= 0 ? (
              <><ArrowUpRight className="h-3 w-3" /><span className="font-tabular tabular-nums">+{metrics.revenue.growth}%</span></>
            ) : (
              <><ArrowDownRight className="h-3 w-3 text-rose-500" /><span className="font-tabular tabular-nums text-rose-500">{metrics?.revenue?.growth}%</span></>
            )}
             dari bulan lalu
          </div>
        </div>

        {/* Stat 2: Transaksi */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card transition-all hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Transaksi Berhasil
            </p>
            <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center">
              <Package className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100 font-tabular tabular-nums">
            {isLoading ? "..." : new Intl.NumberFormat('id-ID').format(metrics?.transactions.total || 0)}
          </p>
          <div className="mt-2 flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
            {metrics?.transactions?.growth && metrics.transactions.growth >= 0 ? (
              <><ArrowUpRight className="h-3 w-3" /><span className="font-tabular tabular-nums">+{metrics.transactions.growth}%</span></>
            ) : (
              <><ArrowDownRight className="h-3 w-3 text-rose-500" /><span className="font-tabular tabular-nums text-rose-500">{metrics?.transactions?.growth}%</span></>
            )}
             dari bulan lalu
          </div>
        </div>

        {/* Stat 3: Pelanggan (RFM) */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card transition-all hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Pelanggan Aktif
            </p>
            <div className="h-8 w-8 rounded-full bg-sky-100 dark:bg-sky-950/60 flex items-center justify-center">
              <Users className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100 font-tabular tabular-nums">
            {isLoading ? "..." : new Intl.NumberFormat('id-ID').format(metrics?.customers.total || 0)}
          </p>
          <div className="mt-2 flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Total pelanggan tersimpan</span>
          </div>
        </div>

        {/* Stat 4: Peringatan Stok */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card transition-all hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Peringatan Stok
            </p>
            <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100 font-tabular tabular-nums">
            {isLoading ? "..." : metrics?.inventory.low_stock_count || 0} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">item</span>
          </p>
          <div className="mt-2 flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
            <span>Segera lakukan restock</span>
          </div>
        </div>
      </div>

      {/* AREA GRAFIK & ANALISIS (Grid 3 Kolom di Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri (Makan 2 kolom): Grafik Prediksi Prophet */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Prediksi Penjualan (AI Prophet)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Estimasi tren pendapatan untuk 30 hari ke depan
              </p>
            </div>
            <button className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
              Lihat Detail
            </button>
          </div>

          <div className="flex-1 w-full">
            <ProphetChart trendData={metrics?.sales_trend || []} />
          </div>
        </div>

        {/* Kolom Kanan (Makan 1 kolom): Peringkat Keputusan AHP */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card flex flex-col min-h-[400px]">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Rekomendasi Supplier (AHP)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Peringkat berdasarkan harga, kualitas, & waktu kirim
            </p>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            {/* Item Peringkat 1 */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/40">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 dark:bg-indigo-500 text-xs font-bold text-white font-tabular tabular-nums">
                  1
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    PT. Maju Logistik
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-tabular tabular-nums">Skor AHP: 0.4250</p>
                </div>
              </div>
              <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                Terbaik
              </span>
            </div>

            {/* Item Peringkat 2 */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 font-tabular tabular-nums">
                  2
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    CV. Berkah Bumi
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-tabular tabular-nums">Skor AHP: 0.3100</p>
                </div>
              </div>
            </div>

            {/* Item Peringkat 3 */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 font-tabular tabular-nums">
                  3
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    Sumber Rejeki
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-tabular tabular-nums">Skor AHP: 0.1850</p>
                </div>
              </div>
            </div>
          </div>

          <button className="mt-4 w-full py-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            Hitung Ulang Kriteria AHP
          </button>
        </div>
      </div>
    </div>
  );
}
