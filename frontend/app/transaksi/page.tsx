"use client";

import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  Search,
  FileText,
  RefreshCw,
  ShoppingBag,
  Wrench,
  PackageCheck,
  RotateCcw,
  Printer,
  CreditCard,
  Banknote,
  QrCode,
  Calendar,
  DollarSign,
  TrendingUp,
  Receipt,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { transactionsApi, type BackendTransaction } from "@/lib/api/transactions";
import { useDebounce } from "@/hooks/useDebounce";
import { ReturnRentalModal } from "@/components/transaksi/ReturnRentalModal";
import { ReceiptPrintModal } from "@/components/transaksi/ReceiptPrintModal";

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function TransaksiPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedPayment, setSelectedPayment] = useState<string>("ALL");
  const [viewingTransaction, setViewingTransaction] = useState<BackendTransaction | null>(null);
  const [returningTransaction, setReturningTransaction] = useState<BackendTransaction | null>(null);
  const [printingTransaction, setPrintingTransaction] = useState<BackendTransaction | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch Transactions
  const { data: transactionsResponse, isLoading, isFetching } = useQuery({
    queryKey: ["transactions", debouncedSearch, selectedType, selectedPayment],
    queryFn: () =>
      transactionsApi.getTransactions({
        search: debouncedSearch.trim() || undefined,
        type: selectedType !== "ALL" ? selectedType : undefined,
        payment_method: selectedPayment !== "ALL" ? selectedPayment : undefined,
      }),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const transactions = transactionsResponse?.data || [];
  const summary = transactionsResponse?.summary;
  const totalCount = summary?.total_count ?? transactionsResponse?.meta?.total ?? transactions.length;
  const totalOmzet = summary?.total_revenue ?? transactions.reduce((sum, t) => sum + Number(t.total_amount || 0), 0);
  const rentalCount = summary?.total_rentals ?? transactions.filter((t) => t.type === "rental" || t.type === "mixed").length;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            Riwayat Transaksi Kasir
            {isFetching && !isLoading && (
              <RefreshCw className="h-4 w-4 animate-spin text-indigo-500" />
            )}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Daftar laporan transaksi faktur penjualan, layanan jasa, dan persewaan aset.
          </p>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Faktur Transaksi</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 font-tabular tabular-nums">
              {totalCount} <span className="text-xs font-normal text-slate-400">Transaksi</span>
            </p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Receipt className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Omzet Penjualan</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-tabular tabular-nums">
              {formatRupiah(totalOmzet)}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Transaksi Sewa & Mixed</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 font-tabular tabular-nums">
              {rentalCount} <span className="text-xs font-normal text-slate-400">Faktur</span>
            </p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <PackageCheck className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ID Faktur atau Nama Pelanggan..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
          {[
            { id: "ALL", label: "Semua Tipe" },
            { id: "sale", label: "Barang (Sale)" },
            { id: "service", label: "Jasa (Service)" },
            { id: "rental", label: "Sewa (Rental)" },
            { id: "mixed", label: "Campuran" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-all ${
                selectedType === tab.id
                  ? "bg-indigo-600 text-white shadow-sm font-semibold"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TABEL TRANSAKSI */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Faktur & Waktu
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Pelanggan
                </th>
                <th scope="col" className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Tipe Transaksi
                </th>
                <th scope="col" className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Pembayaran
                </th>
                <th scope="col" className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Total Bayar
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
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20 mx-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16 mx-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24 ml-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16 ml-auto"></div></td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="h-8 w-8 opacity-30" />
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Belum ada riwayat transaksi.
                      </p>
                      <p className="text-xs text-slate-400">
                        Gunakan menu Kasir (POS) untuk melakukan transaksi penjualan pertama.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((trx) => {
                  const customerName = trx.customer?.name || "Pelanggan Umum (Walk-in)";
                  const hasRentalItem = trx.type === "rental" || trx.type === "mixed" || trx.items?.some((i) => i.itemable_type.includes("RentalItem"));

                  return (
                    <tr
                      key={trx.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold font-mono text-slate-900 dark:text-slate-100">
                          #{trx.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {formatDate(trx.created_at)}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-200">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{customerName}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold 
                          ${
                            trx.type === "sale"
                              ? "bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300"
                              : trx.type === "service"
                                ? "bg-violet-100 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300"
                                : trx.type === "rental"
                                  ? "bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300"
                                  : "bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300"
                          }`}
                        >
                          {trx.type === "sale" ? (
                            <ShoppingBag className="h-3 w-3" />
                          ) : trx.type === "service" ? (
                            <Wrench className="h-3 w-3" />
                          ) : (
                            <PackageCheck className="h-3 w-3" />
                          )}
                          {trx.type === "sale"
                            ? "BARANG"
                            : trx.type === "service"
                              ? "JASA"
                              : trx.type === "rental"
                                ? "SEWA"
                                : "CAMPURAN"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">
                          {trx.payment_method === "cash" ? (
                            <Banknote className="h-3.5 w-3.5 text-emerald-500" />
                          ) : trx.payment_method === "qris" ? (
                            <QrCode className="h-3.5 w-3.5 text-indigo-500" />
                          ) : (
                            <CreditCard className="h-3.5 w-3.5 text-blue-500" />
                          )}
                          {trx.payment_method}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-right font-bold text-slate-900 dark:text-slate-100 font-tabular tabular-nums">
                        {formatRupiah(trx.total_amount)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPrintingTransaction(trx)}
                            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors"
                            title="Cetak Struk Thermal"
                          >
                            <Printer className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setViewingTransaction(trx)}
                            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors"
                            title="Lihat Detail Struk"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                          {hasRentalItem && (
                            <button
                              onClick={() => setReturningTransaction(trx)}
                              className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-lg transition-colors"
                              title="Pengembalian Sewa"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </button>
                          )}
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

      {/* MODAL DETAIL STRUK */}
      {viewingTransaction && (
        <Dialog open={!!viewingTransaction} onOpenChange={() => setViewingTransaction(null)}>
          <DialogContent className="sm:max-w-[520px] bg-white dark:bg-slate-900 rounded-xl shadow-modal border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                <span>Struk Faktur Penjualan</span>
                <span className="text-xs font-mono text-slate-400">
                  #{viewingTransaction.id.slice(0, 8).toUpperCase()}
                </span>
              </DialogTitle>
            </DialogHeader>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 space-y-3 text-xs border border-slate-200 dark:border-slate-800 my-2">
              <div className="flex justify-between text-slate-500">
                <span>Tanggal Transaksi:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {formatDate(viewingTransaction.created_at)}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Pelanggan:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {viewingTransaction.customer?.name || "Pelanggan Umum (Walk-in)"}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 border-b border-slate-200 dark:border-slate-700 pb-2">
                <span>Metode Pembayaran:</span>
                <span className="font-semibold uppercase text-slate-700 dark:text-slate-200">
                  {viewingTransaction.payment_method}
                </span>
              </div>

              <div className="space-y-1.5 pt-1">
                <p className="font-semibold text-slate-700 dark:text-slate-300">Detail Rincian Item:</p>
                {viewingTransaction.items?.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">
                      {item.quantity}x {item.itemable?.name || `Item (${item.itemable_id.slice(0, 6)})`}
                    </span>
                    <span className="font-tabular tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                      {formatRupiah(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-2 space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>{formatRupiah(viewingTransaction.subtotal)}</span>
                </div>
                {viewingTransaction.discount > 0 && (
                  <div className="flex justify-between text-rose-500">
                    <span>Diskon</span>
                    <span>-{formatRupiah(viewingTransaction.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Pajak (PPN)</span>
                  <span>{formatRupiah(viewingTransaction.tax)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-slate-100 pt-1.5 border-t border-slate-200 dark:border-slate-700">
                  <span>Total Tagihan</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-tabular tabular-nums">
                    {formatRupiah(viewingTransaction.total_amount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setPrintingTransaction(viewingTransaction)}
                className="inline-flex items-center gap-2 border-slate-300 dark:border-slate-700"
              >
                <Printer className="h-4 w-4 text-indigo-600" /> Cetak Nota Kasir
              </Button>
              <Button
                onClick={() => setViewingTransaction(null)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Tutup
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* MODAL PENGEMBALIAN SEWA */}
      <ReturnRentalModal
        isOpen={!!returningTransaction}
        onClose={() => setReturningTransaction(null)}
        transaction={returningTransaction}
      />

      {/* MODAL CETAK STRUK THERMAL & PDF */}
      <ReceiptPrintModal
        isOpen={!!printingTransaction}
        onClose={() => setPrintingTransaction(null)}
        transaction={printingTransaction}
      />
    </div>
  );
}
