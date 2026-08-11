"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Award, Zap, AlertTriangle, UserPlus, ShieldAlert, Sparkles } from "lucide-react";

interface RfmDistributionChartProps {
  summary: Record<string, number>;
}

const SEGMENT_COLORS: Record<string, string> = {
  Champions: "#10b981", // Emerald
  "Loyal Customers": "#6366f1", // Indigo
  "Potential Loyalists": "#0284c7", // Sky
  "New Customers": "#8b5cf6", // Purple
  "At Risk": "#f59e0b", // Amber
  "Hibernating / Lost": "#ef4444", // Red
};

const SEGMENT_STRATEGIES: Record<string, { icon: any; action: string; badgeColor: string }> = {
  Champions: {
    icon: Award,
    action: "Berikan reward VIP, akses produk eksklusif baru, dan jadikan brand ambassador.",
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  },
  "Loyal Customers": {
    icon: Zap,
    action: "Tawarkan program loyalitas/poin rewards dan rekomendasi cross-selling.",
    badgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
  },
  "Potential Loyalists": {
    icon: Sparkles,
    action: "Tawarkan diskon membership atau cashback untuk mendorong belanja berikutnya.",
    badgeColor: "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800",
  },
  "New Customers": {
    icon: UserPlus,
    action: "Kirim pesan onboarding, panduan produk, dan voucher transaksi kedua.",
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  },
  "At Risk": {
    icon: AlertTriangle,
    action: "Kirim email/WA promosi reakivasi khusus 'Kami Rindu Anda' dengan potongan harga.",
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  },
  "Hibernating / Lost": {
    icon: ShieldAlert,
    action: "Lakukan kampanye win-back agresif atau diskon cuci gudang.",
    badgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  },
};

export function RfmDistributionChart({ summary }: RfmDistributionChartProps) {
  const chartData = Object.entries(summary).map(([segment, count]) => ({
    segment,
    jumlah: count,
    fill: SEGMENT_COLORS[segment] || "#94a3b8",
  }));

  const total = Object.values(summary).reduce((a, b) => a + b, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Visualisasi Grafik Distribusi Bar Chart */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-card flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Distribsi Segmen RFM Pelanggan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Pengelompokan berdasarkan Recency (Kebaruan), Frequency (Frekuensi), & Monetary (Nilai Transaksi)
            </p>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Total {total} Pelanggan
          </span>
        </div>

        <div className="h-[280px] w-full mt-2">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Belum ada data segmen RFM terhitung.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-200 dark:stroke-slate-800" />
                <XAxis
                  dataKey="segment"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    borderRadius: "10px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    fontSize: "12px",
                    color: "#fff",
                  }}
                  formatter={(value: any) => [`${value} Pelanggan`, "Jumlah"]}
                />
                <Bar dataKey="jumlah" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Kartu Panduan Strategi Segmen */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-card flex flex-col justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
            Rekomendasi Reaktivasi
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Strategi pemasaran berdasarkan segmen dominan pelanggan Anda.
          </p>

          <div className="flex flex-col gap-3 max-h-[290px] overflow-y-auto pr-1">
            {Object.entries(summary).map(([segment, count]) => {
              const strat = SEGMENT_STRATEGIES[segment] || {
                icon: Sparkles,
                action: "Pertahankan hubungan baik dan lakukan follow up berkala.",
                badgeColor: "bg-slate-100 text-slate-800 border-slate-200",
              };
              const Icon = strat.icon;
              const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : "0";

              return (
                <div
                  key={segment}
                  className="p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col gap-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${strat.badgeColor}`}>
                      <Icon className="h-3 w-3" />
                      {segment}
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {strat.action}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
