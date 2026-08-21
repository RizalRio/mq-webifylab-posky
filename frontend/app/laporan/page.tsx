"use client";

import React, { useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useQuery } from "@tanstack/react-query";
import { getSalesReport, getItemsReport, exportPdfReport } from "@/lib/api/reports";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Download,
  Printer,
  TrendingUp,
  Receipt,
  Wallet,
  Tag,
  Loader2,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function LaporanPage() {
  const [activeTab, setActiveTab] = useState<"sales" | "items">("sales");
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Default to last 30 days
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });

  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const { data: salesReport, isLoading: isSalesLoading } = useQuery({
    queryKey: ["salesReport", startDate, endDate],
    queryFn: () => getSalesReport(startDate, endDate),
  });

  const { data: itemsReport, isLoading: isItemsLoading } = useQuery({
    queryKey: ["itemsReport", startDate, endDate],
    queryFn: () => getItemsReport(startDate, endDate),
  });

  // Export CSV Function
  const exportToCSV = () => {
    let csvContent = "";

    if (activeTab === "sales" && salesReport?.data) {
      csvContent =
        "Tanggal,Total Transaksi,Subtotal,Diskon,Pajak,Total Pendapatan\n";
      salesReport.data.forEach((row) => {
        csvContent += `${row.date},${row.total_transactions},${row.total_subtotal},${row.total_discount},${row.total_tax},${row.total_revenue}\n`;
      });
    } else if (activeTab === "items" && itemsReport?.data) {
      csvContent = "ID,Tipe,Nama Item,Total Terjual,Total Pendapatan\n";
      itemsReport.data.forEach((row) => {
        csvContent += `${row.id},${row.type},"${row.name}",${row.total_quantity},${row.total_revenue}\n`;
      });
    }

    if (!csvContent) return;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `laporan_${activeTab}_${startDate}_to_${endDate}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = async () => {
    try {
      setIsExportingPdf(true);
      const blob = await exportPdfReport(startDate, endDate);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `laporan_posky_${startDate}_to_${endDate}.pdf`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to export PDF", error);
      alert("Gagal mengunduh PDF. Pastikan backend server menyala.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Laporan & Analitik
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Pantau performa bisnis, ekspor data, dan evaluasi penjualan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Ekspor CSV
          </button>
          <button
            onClick={handlePrint}
            disabled={isExportingPdf}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExportingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
            {isExportingPdf ? 'Mengunduh...' : 'Unduh PDF'}
          </button>
        </div>
      </div>

      {/* Date Filter & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 print:hidden">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("sales")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === "sales"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Ringkasan Penjualan
          </button>
          <button
            onClick={() => setActiveTab("items")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === "items"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Performa Produk
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <span className="text-slate-400 text-sm">s/d</span>
          <div className="relative">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Print Header (Only visible when printing) */}
      <div className="hidden print:block text-center pb-4 border-b border-slate-200 mb-6">
        <h2 className="text-2xl font-bold">Laporan POSKY</h2>
        <p className="text-sm text-slate-500">
          {activeTab === "sales" ? "Ringkasan Penjualan" : "Performa Produk"} |{" "}
          {formatDate(startDate)} s/d {formatDate(endDate)}
        </p>
      </div>

      {/* CONTENT TABS */}
      {activeTab === "sales" && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <Wallet className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Total Pendapatan
                </h3>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(salesReport?.summary?.total_revenue || 0)}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg">
                  <Receipt className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Total Transaksi
                </h3>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {salesReport?.summary?.total_transactions || 0}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg">
                  <Tag className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Total Diskon
                </h3>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(salesReport?.summary?.total_discount || 0)}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Rata-rata Transaksi
                </h3>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(
                  (salesReport?.summary?.total_revenue || 0) /
                    (salesReport?.summary?.total_transactions || 1),
                )}
              </p>
            </div>
          </div>

          {/* Chart - Hidden on Print to save ink, or keep it depending on preference. We keep it but format nicely. */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 print:break-inside-avoid">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6">
              Grafik Tren Pendapatan
            </h3>
            <div className="h-72 w-full">
              {isSalesLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesReport?.data || []}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#334155"
                      opacity={0.2}
                    />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(val) =>
                        new Date(val).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })
                      }
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={12}
                      tickFormatter={(val) =>
                        `Rp${(val / 1000000).toFixed(1)}M`
                      }
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(99, 102, 241, 0.1)" }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      formatter={(value: any) => [
                        formatCurrency(Number(value) || 0),
                        "Pendapatan",
                      ]}
                      labelFormatter={(label) => formatDate(label as string)}
                    />
                    <Bar
                      dataKey="total_revenue"
                      fill="#4f46e5"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden print:break-before-auto">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 uppercase border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Tanggal</th>
                    <th className="px-6 py-4 font-semibold text-right">
                      Jml Transaksi
                    </th>
                    <th className="px-6 py-4 font-semibold text-right">
                      Diskon
                    </th>
                    <th className="px-6 py-4 font-semibold text-right">
                      Pajak
                    </th>
                    <th className="px-6 py-4 font-semibold text-right">
                      Total Pendapatan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {isSalesLoading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-slate-500"
                      >
                        Memuat data...
                      </td>
                    </tr>
                  ) : salesReport?.data?.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-slate-500"
                      >
                        Tidak ada data penjualan pada rentang tanggal ini.
                      </td>
                    </tr>
                  ) : (
                    salesReport?.data?.map((row, i) => (
                      <tr
                        key={i}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <td className="px-6 py-4">{formatDate(row.date)}</td>
                        <td className="px-6 py-4 text-right">
                          {row.total_transactions}
                        </td>
                        <td className="px-6 py-4 text-right text-rose-600">
                          {formatCurrency(row.total_discount)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {formatCurrency(row.total_tax)}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">
                          {formatCurrency(row.total_revenue)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "items" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Performa Produk & Layanan
              </h3>
              <p className="text-sm text-slate-500">
                Daftar item paling laku (Top Sellers) berdasarkan kuantitas
                terjual.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 uppercase border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Tipe</th>
                    <th className="px-6 py-4 font-semibold">Nama Item</th>
                    <th className="px-6 py-4 font-semibold text-right">
                      Kuantitas Terjual
                    </th>
                    <th className="px-6 py-4 font-semibold text-right">
                      Total Pendapatan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {isItemsLoading ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-8 text-center text-slate-500"
                      >
                        Memuat data...
                      </td>
                    </tr>
                  ) : itemsReport?.data?.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-8 text-center text-slate-500"
                      >
                        Tidak ada data penjualan item pada rentang tanggal ini.
                      </td>
                    </tr>
                  ) : (
                    itemsReport?.data?.map((row, i) => (
                      <tr
                        key={i}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 text-[10px] font-bold rounded-full ${
                              row.type === "Barang"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400"
                                : row.type === "Jasa"
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400"
                                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400"
                            }`}
                          >
                            {row.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                          {row.name}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">
                          {row.total_quantity}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(row.total_revenue)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
