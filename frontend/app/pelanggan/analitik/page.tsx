"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Award,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  Search,
} from "lucide-react";
import Link from "next/link";
import { getRfmAnalytics, getCohortAnalytics } from "@/lib/api/analytics";
import { RfmDistributionChart } from "@/components/pelanggan/RfmDistributionChart";
import { CohortHeatmap } from "@/components/pelanggan/CohortHeatmap";

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
};

const getBadgeStyle = (segment: string) => {
  switch (segment) {
    case "Champions":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800";
    case "Loyal Customers":
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800";
    case "Potential Loyalists":
      return "bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border-sky-300 dark:border-sky-800";
    case "New Customers":
      return "bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300 dark:border-purple-800";
    case "At Risk":
      return "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800";
    default:
      return "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800";
  }
};

export default function PelangganAnalitikPage() {
  // Fetch RFM Analytics Data
  const {
    data: rfmResponse,
    isLoading: isRfmLoading,
    refetch: refetchRfm,
  } = useQuery({
    queryKey: ["analytics-rfm-full"],
    queryFn: getRfmAnalytics,
    staleTime: 60 * 1000,
  });

  // Fetch Cohort Matrix Data
  const {
    data: cohortMatrix = {},
    isLoading: isCohortLoading,
    refetch: refetchCohort,
  } = useQuery({
    queryKey: ["analytics-cohort-full"],
    queryFn: getCohortAnalytics,
    staleTime: 60 * 1000,
  });

  const rfmSummary = rfmResponse?.summary || {};
  const rfmCustomers = rfmResponse?.data || [];

  // Hitung statistik atas
  const totalCustomers = rfmCustomers.length;
  const totalLifetimeSpent = rfmCustomers.reduce((acc, curr) => acc + (Number(curr.total_spent) || 0), 0);
  const championsCount = rfmSummary["Champions"] || 0;
  const atRiskCount = (rfmSummary["At Risk"] || 0) + (rfmSummary["Hibernating / Lost"] || 0);

  const handleRefresh = () => {
    refetchRfm();
    refetchCohort();
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 pb-10">
      {/* HEADER HALAMAN */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/pelanggan"
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Daftar Pelanggan
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            Analitik Pelanggan Lanjutan
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              <Sparkles className="h-3 w-3" /> RFM & Cohort
            </span>
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Analisis segmentasi perilaku transaksi dan matriks retensi pelanggan per kohort bulan.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-card transition-all"
        >
          <RefreshCw className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          Muat Ulang Data
        </button>
      </div>

      {/* KARTU RINGKASAN METRIK (4 Kolom) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Total Pelanggan Teranalisis */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Pelanggan Teranalisis</p>
            <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center">
              <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100 font-tabular tabular-nums">
            {isRfmLoading ? "..." : totalCustomers}
          </p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Terdaftar dalam basis data tenant</p>
        </div>

        {/* Card 2: Champions */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Pelanggan Champions (VIP)</p>
            <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center">
              <Award className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-tabular tabular-nums">
            {isRfmLoading ? "..." : championsCount}
          </p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Paling sering & tertinggi belanjanya</p>
        </div>

        {/* Card 3: Total Lifetime Value */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Lifetime Value</p>
            <div className="h-8 w-8 rounded-full bg-sky-100 dark:bg-sky-950/60 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100 font-tabular tabular-nums">
            {isRfmLoading ? "..." : formatRupiah(totalLifetimeSpent)}
          </p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Akumulasi pengeluaran semua pelanggan</p>
        </div>

        {/* Card 4: Pelanggan Butuh Reaktivasi */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Butuh Reaktivasi (At Risk)</p>
            <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-amber-600 dark:text-amber-400 font-tabular tabular-nums">
            {isRfmLoading ? "..." : atRiskCount}
          </p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Berpotensi berpaling ke kompetitor</p>
        </div>
      </div>

      {/* SECTION 1: GRAFIK DISTRIBUSI RFM */}
      <RfmDistributionChart summary={rfmSummary} />

      {/* SECTION 2: MATRIKS HEATMAP COHORT ANALYSIS */}
      <CohortHeatmap matrix={cohortMatrix} />

      {/* SECTION 3: TABEL LEADERBOARD TOP PELANGGAN */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-card flex flex-col gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Leaderboard Pelanggan Terbaik (Skor RFM)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Daftar pelanggan diurutkan berdasarkan gabungan Skor R (Recency), F (Frequency), dan M (Monetary).
          </p>
        </div>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Nama Pelanggan</th>
                <th className="px-4 py-3">No. Telepon</th>
                <th className="px-4 py-3 text-center">Total Transaksi</th>
                <th className="px-4 py-3 text-right">Total Belanja</th>
                <th className="px-4 py-3 text-center">Skor RFM (R - F - M)</th>
                <th className="px-4 py-3 text-center">Segmen RFM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isRfmLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Memuat leaderboard pelanggan...
                  </td>
                </tr>
              ) : rfmCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Belum ada data pelanggan untuk diurutkan.
                  </td>
                </tr>
              ) : (
                rfmCustomers.slice(0, 15).map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                      {customer.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {customer.phone || "-"}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-800 dark:text-slate-200">
                      {customer.total_transactions}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-indigo-600 dark:text-indigo-400">
                      {formatRupiah(Number(customer.total_spent) || 0)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[11px] font-semibold border border-slate-200 dark:border-slate-700">
                        {customer.r_score ?? "-"} / {customer.f_score ?? "-"} / {customer.m_score ?? "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getBadgeStyle(customer.rfm_segment)}`}>
                        {customer.rfm_segment}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
