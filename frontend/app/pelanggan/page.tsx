"use client";

import { Plus, Search, Edit, Trash2, Filter, Mail, Phone, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

// Data tiruan pelanggan dengan metrik RFM dasar
const CUSTOMER_DATA = [
  {
    id: "CUST-001",
    name: "Budi Santoso",
    phone: "0812-3456-7890",
    email: "budi@email.com",
    totalTransactions: 24,
    totalSpent: 4500000,
    level: "Loyal",
    rfmSegment: "Champions",
  },
  {
    id: "CUST-002",
    name: "Siti Rahmawati",
    phone: "0856-7890-1234",
    email: "-",
    totalTransactions: 2,
    totalSpent: 150000,
    level: "Baru",
    rfmSegment: "Recent Customers",
  },
  {
    id: "CUST-003",
    name: "PT. Maju Bersama",
    phone: "021-7654-3210",
    email: "procurement@maju.co.id",
    totalTransactions: 56,
    totalSpent: 28500000,
    level: "VIP",
    rfmSegment: "Champions",
  },
  {
    id: "CUST-004",
    name: "Andi Wijaya",
    phone: "0899-1122-3344",
    email: "andi.w@email.com",
    totalTransactions: 8,
    totalSpent: 1200000,
    level: "Reguler",
    rfmSegment: "Needs Attention",
  },
  {
    id: "CUST-005",
    name: "Diana Kusuma",
    phone: "0811-2233-4455",
    email: "dianakus@email.com",
    totalTransactions: 1,
    totalSpent: 45000,
    level: "Beresiko",
    rfmSegment: "At Risk",
  },
];

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
};

export default function PelangganPage() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* HEADER & AKSI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Data Pelanggan & Analitik RFM
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Kelola basis data pelanggan dan pantau tingkat loyalitas hasil analisis RFM.
          </p>
        </div>
        <Button className="inline-flex items-center gap-2 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-lg shadow-sm">
          <Plus className="h-4 w-4" />
          Tambah Pelanggan
        </Button>
      </div>

      {/* TOOLBAR (Pencarian & Filter) */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Cari nama, email, atau telepon..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
          />
        </div>
        <Button
          variant="outline"
          className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <Filter className="h-4 w-4" />
          Filter Segmen RFM
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
                  Pelanggan
                </th>
                <th
                  scope="col"
                  className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                >
                  Kontak
                </th>
                <th
                  scope="col"
                  className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                >
                  Total Transaksi
                </th>
                <th
                  scope="col"
                  className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                >
                  Total Belanja
                </th>
                <th
                  scope="col"
                  className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                >
                  Segmen RFM
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
              {CUSTOMER_DATA.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {customer.name}
                    </p>
                    <p className="text-xs font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                      {customer.id}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-tabular tabular-nums">
                        <Phone className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />{" "}
                        {customer.phone}
                      </div>
                      {customer.email !== "-" && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                          <Mail className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />{" "}
                          {customer.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-center text-slate-700 dark:text-slate-300 font-tabular tabular-nums font-medium">
                    {customer.totalTransactions}{" "}
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">kali</span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-right font-bold text-slate-900 dark:text-slate-100 font-tabular tabular-nums">
                    {formatRupiah(customer.totalSpent)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold 
                      ${
                        customer.level === "VIP"
                          ? "bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300"
                          : customer.level === "Loyal"
                            ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300"
                            : customer.level === "Reguler"
                              ? "bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300"
                              : customer.level === "Baru"
                                ? "bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300"
                                : "bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300"
                      }`}
                    >
                      <UserCheck className="h-3 w-3" />
                      {customer.rfmSegment} ({customer.level})
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors"
                        title="Edit Pelanggan"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                        title="Hapus Pelanggan"
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
      </div>
    </div>
  );
}
