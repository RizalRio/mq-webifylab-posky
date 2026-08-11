"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import "dayjs/locale/id";
import dayjs from "dayjs";

interface TrendData {
  date: string;
  sales: number;
}

interface ProphetChartProps {
  trendData: TrendData[];
}

export function ProphetChart({ trendData }: ProphetChartProps) {
  // Format data untuk Recharts
  const chartData = trendData.map((item) => ({
    tanggal: dayjs(item.date).format("D MMM"),
    aktual: item.sales,
  }));

  return (
    <div className="h-[320px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            className="stroke-slate-200 dark:stroke-slate-800"
          />

          <XAxis
            dataKey="tanggal"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#94a3b8" }}
            dy={10}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#94a3b8" }}
            tickFormatter={(value) => {
              if (value >= 1000000)
                return `Rp ${(value / 1000000).toFixed(1)}M`;
              if (value >= 1000) return `Rp ${(value / 1000).toFixed(0)}K`;
              return `Rp ${value}`;
            }}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.9)",
              backdropFilter: "blur(4px)",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
              fontSize: "12px",
              color: "#f8fafc",
            }}
            itemStyle={{ color: "#f8fafc", fontWeight: 500 }}
            formatter={(value: any) => [
              new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(value),
              "Pendapatan",
            ]}
          />

          {/* Area Sekunder (Data Aktual - Warna Indigo Solid) */}
          <Area
            type="monotone"
            dataKey="aktual"
            stroke="#4f46e5"
            strokeWidth={3}
            fill="url(#colorAktual)"
            fillOpacity={1}
            name="Aktual"
          />

          {/* Definisi Gradien Warna */}
          <defs>
            <linearGradient id="colorAktual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
            </linearGradient>
          </defs>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
