"use client";

import { useMemo } from "react";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

interface CohortHeatmapProps {
  matrix: Record<string, Record<string, number>>;
}

export function CohortHeatmap({ matrix }: CohortHeatmapProps) {
  // Ambil daftar bulan kohort (baris) dan daftar bulan transaksi (kolom)
  const cohortMonths = useMemo(() => Object.keys(matrix).sort(), [matrix]);

  // Kumpulkan semua transaksi bulan unik secara berurutan
  const allTransactionMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    Object.values(matrix).forEach((months) => {
      Object.keys(months).forEach((m) => monthsSet.add(m));
    });
    return Array.from(monthsSet).sort();
  }, [matrix]);

  // Fungsi penentuan warna gradasi hijau berdasarkan persentase retensi
  const getCellColor = (percentage: number) => {
    if (percentage >= 80) return "bg-emerald-600 text-white font-semibold";
    if (percentage >= 50) return "bg-emerald-500 text-white font-medium";
    if (percentage >= 30) return "bg-emerald-400 text-slate-900 font-medium";
    if (percentage >= 15) return "bg-emerald-200 text-emerald-900 font-medium dark:bg-emerald-900/60 dark:text-emerald-200";
    if (percentage > 0) return "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300";
    return "bg-slate-50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-600";
  };

  const formatMonthHeader = (dateStr: string) => {
    return dayjs(dateStr + "-01").format("MMM YYYY");
  };

  if (!cohortMonths.length) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-card flex flex-col items-center justify-center text-center">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Belum ada data transaksi yang cukup untuk Cohort Analysis retensi.
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Matriks akan otomatis terisi seiring berjalannya transaksi dari bulan ke bulan.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-card flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Matriks Retensi Pelanggan (Cohort Analysis)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Persentase pelanggan yang kembali bertransaksi pada bulan-bulan berikutnya setelah transaksi pertama mereka.
          </p>
        </div>

        {/* Legend Warna */}
        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
          <span>0%</span>
          <div className="h-3 w-4 rounded bg-slate-100 dark:bg-slate-800"></div>
          <div className="h-3 w-4 rounded bg-emerald-100 dark:bg-emerald-950"></div>
          <div className="h-3 w-4 rounded bg-emerald-300 dark:bg-emerald-700"></div>
          <div className="h-3 w-4 rounded bg-emerald-500"></div>
          <div className="h-3 w-4 rounded bg-emerald-600"></div>
          <span>100%</span>
        </div>
      </div>

      {/* Tabel Heatmap scrollable */}
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
              <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 min-w-[130px]">
                Bulan Kohort
              </th>
              <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 text-center min-w-[90px]">
                Total Pelanggan
              </th>
              {allTransactionMonths.map((txMonth, index) => (
                <th
                  key={txMonth}
                  className="px-3 py-3 font-semibold text-slate-700 dark:text-slate-300 text-center min-w-[85px]"
                >
                  Bulan {index}
                  <span className="block text-[10px] font-normal text-slate-400">
                    ({formatMonthHeader(txMonth)})
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {cohortMonths.map((cohortMonth) => {
              const rowData = matrix[cohortMonth] || {};
              const initialCount = rowData[cohortMonth] || 0;

              return (
                <tr key={cohortMonth} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                    {formatMonthHeader(cohortMonth)}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-slate-800 dark:text-slate-200">
                    {initialCount}
                  </td>

                  {allTransactionMonths.map((txMonth) => {
                    // Hanya tampilkan jika bulan transaksi >= bulan kohort
                    if (txMonth < cohortMonth) {
                      return (
                        <td
                          key={txMonth}
                          className="px-3 py-2.5 text-center bg-slate-50/40 dark:bg-slate-900/30 text-slate-300 dark:text-slate-700 select-none"
                        >
                          -
                        </td>
                      );
                    }

                    const currentCount = rowData[txMonth] ?? 0;
                    const percentage = initialCount > 0 ? (currentCount / initialCount) * 100 : 0;
                    const cellColorClass = getCellColor(percentage);

                    return (
                      <td key={txMonth} className="px-1 py-1">
                        <div
                          className={`w-full py-2 px-1 rounded-md text-center transition-all ${cellColorClass}`}
                          title={`${currentCount} dari ${initialCount} pelanggan (${percentage.toFixed(1)}%)`}
                        >
                          <span className="block font-semibold">{percentage.toFixed(0)}%</span>
                          <span className="block text-[9px] opacity-80">{currentCount} cust</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
