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
  RefreshCw,
  Loader2,
  BrainCircuit,
  Boxes,
  Award,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDashboardMetrics } from "@/lib/api/analytics";
import { aiApi } from "@/lib/api/ai";
import { Button } from "@/components/ui/button";
import { ProphetChart } from "@/components/dashboard/ProphetChart";
import { toast } from "sonner";

export default function DashboardPage() {
  const queryClient = useQueryClient();

  // 1. Dashboard Sales Metrics
  const { data: metrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ["dashboardMetrics"],
    queryFn: getDashboardMetrics,
    staleTime: 60 * 1000,
  });

  // 2. AHP Supplier Recommendations
  const { data: ahpSuppliers, isLoading: isLoadingAhp } = useQuery({
    queryKey: ["ahpRecommendations"],
    queryFn: aiApi.getAhpRecommendations,
    staleTime: 30 * 1000,
  });

  // 3. Prophet Stock Predictions
  const { data: prophetPredictions, isLoading: isLoadingProphet } = useQuery({
    queryKey: ["prophetPredictions"],
    queryFn: aiApi.getProphetPredictions,
    staleTime: 30 * 1000,
  });

  // Mutations
  const ahpMutation = useMutation({
    mutationFn: aiApi.triggerAhpCalculation,
    onSuccess: (res) => {
      toast.success(res.message || "Tugas AHP dikirimkan ke Redis Queue!");
      queryClient.invalidateQueries({ queryKey: ["ahpRecommendations"] });
    },
    onError: (err: any) => {
      toast.error("Gagal memicu AHP: " + (err.response?.data?.message || err.message));
    },
  });

  const prophetMutation = useMutation({
    mutationFn: aiApi.triggerProphetPrediction,
    onSuccess: (res) => {
      toast.success(res.message || "Tugas Prophet Forecasting dikirimkan ke Redis Queue!");
      queryClient.invalidateQueries({ queryKey: ["prophetPredictions"] });
    },
    onError: (err: any) => {
      toast.error("Gagal memicu Prophet: " + (err.response?.data?.message || err.message));
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-12">
      {/* HEADER HALAMAN */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            Overview Analitik
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              <Sparkles className="h-3.5 w-3.5" /> AI Worker Active
            </span>
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Pantau performa transaksi dan peramalan ML Prophet & DSS AHP secara realtime.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => prophetMutation.mutate()}
            disabled={prophetMutation.isPending}
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 px-3 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 transition-all shadow-xs"
          >
            {prophetMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <BrainCircuit className="h-3.5 w-3.5" />
            )}
            Run Prophet AI
          </button>

          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition-all">
            <Calendar className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            Bulan Ini
          </button>
        </div>
      </div>

      {/* KARTU STATISTIK (Grid 4 Kolom) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Stat 1: Pendapatan */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Pendapatan</p>
            <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100 font-tabular tabular-nums">
            {isLoadingMetrics ? "..." : formatCurrency(metrics?.revenue.total || 0)}
          </p>
          <div className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            {metrics?.revenue?.growth && metrics.revenue.growth >= 0 ? (
              <>
                <ArrowUpRight className="h-3 w-3" />
                <span className="font-tabular tabular-nums">+{metrics.revenue.growth}%</span>
              </>
            ) : (
              <>
                <ArrowDownRight className="h-3 w-3 text-rose-500" />
                <span className="font-tabular tabular-nums text-rose-500">
                  {metrics?.revenue?.growth}%
                </span>
              </>
            )}
            <span className="text-slate-500">dari bulan lalu</span>
          </div>
        </div>

        {/* Stat 2: Transaksi */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Transaksi Berhasil
            </p>
            <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center">
              <Package className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100 font-tabular tabular-nums">
            {isLoadingMetrics
              ? "..."
              : new Intl.NumberFormat("id-ID").format(metrics?.transactions.total || 0)}
          </p>
          <div className="mt-2 flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
            {metrics?.transactions?.growth && metrics.transactions.growth >= 0 ? (
              <>
                <ArrowUpRight className="h-3 w-3" />
                <span className="font-tabular tabular-nums">+{metrics.transactions.growth}%</span>
              </>
            ) : (
              <>
                <ArrowDownRight className="h-3 w-3 text-rose-500" />
                <span className="font-tabular tabular-nums text-rose-500">
                  {metrics?.transactions?.growth}%
                </span>
              </>
            )}
            <span className="text-slate-500">dari bulan lalu</span>
          </div>
        </div>

        {/* Stat 3: Pelanggan (RFM) */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Pelanggan Aktif</p>
            <div className="h-8 w-8 rounded-full bg-sky-100 dark:bg-sky-950/60 flex items-center justify-center">
              <Users className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100 font-tabular tabular-nums">
            {isLoadingMetrics
              ? "..."
              : new Intl.NumberFormat("id-ID").format(metrics?.customers.total || 0)}
          </p>
          <div className="mt-2 flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Total pelanggan tersimpan</span>
          </div>
        </div>

        {/* Stat 4: Peringatan Stok */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Peringatan Stok</p>
            <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100 font-tabular tabular-nums">
            {isLoadingMetrics ? "..." : metrics?.inventory.low_stock_count || 0}{" "}
            <span className="text-sm font-normal text-slate-500 dark:text-slate-400">item</span>
          </p>
          <div className="mt-2 flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
            <span>Segera lakukan restock</span>
          </div>
        </div>
      </div>

      {/* AREA GRAFIK & ANALISIS (Grid 3 Kolom di Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri (Makan 2 kolom): Grafik Sales Trend & Prophet */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Tren Penjualan 30 Hari
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pergerakan omzet aktual hasil transaksi faktur toko
              </p>
            </div>
          </div>

          <div className="flex-1 w-full">
            <ProphetChart trendData={metrics?.sales_trend || []} />
          </div>
        </div>

        {/* Kolom Kanan (Makan 1 kolom): Peringkat Keputusan AHP (REAL DATA) */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card flex flex-col justify-between min-h-[400px]">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-amber-500" /> Rekomendasi Supplier (AHP)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Peringkat berdasarkan matriks kriteria berbobot
                </p>
              </div>
            </div>

            {isLoadingAhp ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-500 mb-2" />
                <p className="text-xs">Memuat rekomendasi...</p>
              </div>
            ) : !ahpSuppliers || ahpSuppliers.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <p className="text-xs text-slate-400">Belum ada hasil kalkulasi AHP tersimpan.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ahpSuppliers.slice(0, 4).map((supp, index) => (
                  <div
                    key={supp.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      index === 0
                        ? "border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/60 dark:bg-indigo-950/40"
                        : "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold font-tabular tabular-nums ${
                          index === 0
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {supp.rank || index + 1}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                          {supp.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-tabular tabular-nums">
                          Skor: {Number(supp.ahp_score || 0).toFixed(4)}
                        </p>
                      </div>
                    </div>
                    {index === 0 && (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                        Terbaik
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            type="button"
            onClick={() => ahpMutation.mutate()}
            disabled={ahpMutation.isPending}
            variant="outline"
            className="mt-4 w-full h-9 text-xs font-medium border-slate-300 dark:border-slate-700 flex items-center justify-center gap-1.5"
          >
            {ahpMutation.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Menghitung...
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5" /> Hitung Ulang AHP
              </>
            )}
          </Button>
        </div>
      </div>

      {/* SECTION WIDGET PROPHET PREDIKSI STOK HABIS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Boxes className="h-4 w-4 text-indigo-500" /> Prediksi Tanggal Stok Habis (Prophet
              ML)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Analisis deret waktu otomatis menentukan estimasi tanggal kehabisan stok & tingkat
              Safety Stock aman.
            </p>
          </div>

          <button
            onClick={() => prophetMutation.mutate()}
            disabled={prophetMutation.isPending}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
          >
            {prophetMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <BrainCircuit className="h-3.5 w-3.5" />
            )}
            Jalankan Prediction Worker
          </button>
        </div>

        {isLoadingProphet ? (
          <div className="py-8 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-500 mb-2" />
            <p className="text-xs">Memuat data prediksi stok Prophet...</p>
          </div>
        ) : !prophetPredictions || prophetPredictions.length === 0 ? (
          <div className="py-8 text-center space-y-1">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Belum ada prediksi stok tersimpan.
            </p>
            <p className="text-[11px] text-slate-400">
              Klik &quot;Jalankan Prediction Worker&quot; untuk mengekstraksi riwayat penjualan dan
              menghitung estimasi stok habis.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {prophetPredictions.map((pred) => (
              <div
                key={pred.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {pred.product?.name || "Produk ID " + pred.product_id.slice(0, 8)}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Sisa Stok Saat Ini:{" "}
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {pred.product?.stock ?? "-"} unit
                      </span>
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    Confidence {Number(pred.confidence_score) <= 1 ? (Number(pred.confidence_score) * 100).toFixed(0) : Number(pred.confidence_score).toFixed(0)}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Estimasi Habis:</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">
                      {formatDate(pred.estimated_stockout_date)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Safety Stock:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {pred.safety_stock_level} unit
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
