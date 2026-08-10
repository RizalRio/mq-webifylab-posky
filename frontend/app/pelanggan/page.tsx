"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Mail,
  Phone,
  UserCheck,
  Users,
  RefreshCw,
  Award,
  TrendingUp,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { customersApi, type BackendCustomer } from "@/lib/api/customers";
import { useDebounce } from "@/hooks/useDebounce";
import { AddCustomerModal } from "@/components/pelanggan/AddCustomerModal";
import { EditCustomerModal } from "@/components/pelanggan/EditCustomerModal";
import { toast } from "sonner";

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
};

export default function PelangganPage() {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<BackendCustomer | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRfmSegment, setSelectedRfmSegment] = useState<string>("ALL");

  // Debounce kata kunci pencarian 300ms
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch Customers dari API backend
  const { data: customersResponse, isLoading, isFetching } = useQuery({
    queryKey: ["customers", debouncedSearch, selectedRfmSegment],
    queryFn: () =>
      customersApi.getCustomers({
        search: debouncedSearch,
        rfm_segment: selectedRfmSegment !== "ALL" ? selectedRfmSegment : undefined,
      }),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Fetch RFM Analytics Summary dari API /analytics/rfm
  const { data: rfmAnalyticsResponse } = useQuery({
    queryKey: ["analytics-rfm"],
    queryFn: () => customersApi.getRfmAnalytics(),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const customers = customersResponse?.data || [];
  const rfmSummary = rfmAnalyticsResponse?.summary || {};

  // Stat summary calculations
  const totalCustomersCount = customersResponse?.meta?.total ?? customers.length;
  const totalRevenueAll = customers.reduce((sum, c) => sum + (Number(c.total_spent) || 0), 0);
  const championsCount = rfmSummary["Champions"] || customers.filter((c) => c.rfm_segment === "Champions").length;

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      return await customersApi.deleteCustomer(id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-rfm"] });
      toast.success(`Pelanggan "${variables.name}" berhasil dihapus.`);
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Gagal menghapus data pelanggan.";
      toast.error("Gagal menghapus: " + msg);
    },
  });

  const handleDelete = (customer: BackendCustomer) => {
    if (confirm(`Apakah Anda yakin ingin menghapus pelanggan "${customer.name}"?`)) {
      deleteMutation.mutate({ id: customer.id, name: customer.name });
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* HEADER & AKSI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            Data Pelanggan & Analitik RFM
            {isFetching && !isLoading && (
              <RefreshCw className="h-4 w-4 animate-spin text-indigo-500" />
            )}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Kelola basis data pelanggan dan pantau tingkat loyalitas hasil analisis RFM.
          </p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-lg shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Tambah Pelanggan
        </Button>
      </div>

      {/* SUMMARY STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Pelanggan</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 font-tabular tabular-nums">
              {totalCustomersCount} <span className="text-xs font-normal text-slate-400">Orang</span>
            </p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Belanja Pelanggan</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-tabular tabular-nums">
              {formatRupiah(totalRevenueAll)}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Pelanggan Champions</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1 font-tabular tabular-nums">
              {championsCount} <span className="text-xs font-normal text-slate-400">VIP</span>
            </p>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <Award className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* TOOLBAR (Pencarian & Filter Segmen RFM) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, email, atau telepon..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
          />
        </div>

        {/* Filter Tab Segmen RFM */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
          {[
            { id: "ALL", label: "Semua" },
            { id: "Champions", label: "Champions" },
            { id: "Loyal", label: "Loyal" },
            { id: "Recent Customers", label: "Recent" },
            { id: "New", label: "Baru" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedRfmSegment(tab.id)}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-all ${
                selectedRfmSegment === tab.id
                  ? "bg-indigo-600 text-white shadow-sm font-semibold"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TABEL DATA */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Pelanggan
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Kontak
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Alamat
                </th>
                <th scope="col" className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Total Transaksi
                </th>
                <th scope="col" className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Total Belanja
                </th>
                <th scope="col" className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Segmen RFM
                </th>
                <th scope="col" className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-28"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16 mx-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20 ml-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24 mx-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-12 ml-auto"></div></td>
                  </tr>
                ))
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="h-8 w-8 opacity-30" />
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Tidak ada pelanggan ditemukan.
                      </p>
                      <p className="text-xs text-slate-400">
                        Gunakan tombol "Tambah Pelanggan" untuk mendaftarkan data pelanggan baru.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                customers.map((customer) => {
                  const totalTx = customer.total_transactions ?? customer.transactions_count ?? 0;
                  const totalSpent = Number(customer.total_spent || 0);
                  const segment = customer.rfm_segment || (totalTx >= 10 ? "Champions" : totalTx >= 5 ? "Loyal" : totalTx >= 2 ? "Recent Customers" : "New");

                  return (
                    <tr
                      key={customer.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {customer.name}
                        </p>
                        <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                          ID: {customer.id.slice(0, 8)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {customer.phone ? (
                            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-tabular tabular-nums">
                              <Phone className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />{" "}
                              {customer.phone}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">-</span>
                          )}
                          {customer.email && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                              <Mail className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />{" "}
                              {customer.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300">
                        {customer.address || <span className="text-slate-400 italic">-</span>}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-center text-slate-700 dark:text-slate-300 font-tabular tabular-nums font-medium">
                        {totalTx}{" "}
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">kali</span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-right font-bold text-slate-900 dark:text-slate-100 font-tabular tabular-nums">
                        {formatRupiah(totalSpent)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold 
                          ${
                            segment === "Champions"
                              ? "bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300"
                              : segment === "Loyal"
                                ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300"
                                : segment === "Recent Customers" || segment === "Recent"
                                  ? "bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300"
                                  : segment === "At Risk"
                                    ? "bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300"
                                    : "bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300"
                          }`}
                        >
                          <UserCheck className="h-3 w-3" />
                          {segment}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingCustomer(customer)}
                            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors"
                            title="Edit Pelanggan"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(customer)}
                            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                            title="Hapus Pelanggan"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS */}
      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <EditCustomerModal
        isOpen={!!editingCustomer}
        onClose={() => setEditingCustomer(null)}
        customer={editingCustomer}
      />
    </div>
  );
}

