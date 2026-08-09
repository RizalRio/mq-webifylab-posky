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

// Data simulasi: Setengah awal adalah data historis, setengah akhir adalah prediksi AI
const data = [
  { tanggal: "1 Agu", aktual: 12.5, prediksi: 12.0 },
  { tanggal: "5 Agu", aktual: 15.2, prediksi: 14.8 },
  { tanggal: "10 Agu", aktual: 14.1, prediksi: 14.5 },
  { tanggal: "15 Agu", aktual: 16.5, prediksi: 16.0 },
  { tanggal: "20 Agu", aktual: 18.2, prediksi: 17.5 },
  // Mulai titik ini, data aktual kosong (masa depan), hanya ada prediksi
  { tanggal: "25 Agu", aktual: null, prediksi: 19.1 },
  { tanggal: "30 Agu", aktual: null, prediksi: 21.4 },
  { tanggal: "4 Sep", aktual: null, prediksi: 20.8 },
  { tanggal: "9 Sep", aktual: null, prediksi: 23.5 },
];

export function ProphetChart() {
  return (
    <div className="h-[320px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
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
            tickFormatter={(value) => `${value}M`}
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
            formatter={(value: any) => [`Rp ${value} Juta`, "Pendapatan"]}
          />

          {/* Area Utama (Prediksi Prophet - Warna Indigo Soft) */}
          <Area
            type="monotone"
            dataKey="prediksi"
            stroke="#818cf8"
            strokeWidth={2}
            strokeDasharray="5 5"
            fill="#e0e7ff"
            fillOpacity={0.3}
            name="Prediksi AI"
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
