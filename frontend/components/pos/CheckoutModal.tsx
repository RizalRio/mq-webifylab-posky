"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCartStore } from "@/store/useCartStore";
import { customersApi } from "@/lib/api/customers";
import { transactionsApi, type BackendTransaction } from "@/lib/api/transactions";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Printer,
  User,
  CreditCard,
  Banknote,
  QrCode,
  Calendar,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { ReceiptPrintModal } from "@/components/transaksi/ReceiptPrintModal";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
};

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const queryClient = useQueryClient();
  const {
    items,
    subtotal,
    tax,
    total,
    discount,
    setDiscount,
    selectedCustomerId,
    setSelectedCustomerId,
    paymentMethod,
    setPaymentMethod,
    setItemDates,
    clearCart,
  } = useCartStore();

  const [cashAmount, setCashAmount] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [completedTransaction, setCompletedTransaction] = useState<BackendTransaction | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Fetch list customer
  const { data: customersResponse } = useQuery({
    queryKey: ["customers-select"],
    queryFn: () => customersApi.getCustomers({ per_page: 100 }),
    enabled: isOpen,
  });

  const customers = customersResponse?.data || [];

  const hasRental = items.some((item) => item.mode === "SEWA");
  const hasService = items.some((item) => item.mode === "JASA");
  const hasSale = items.some((item) => item.mode === "BARANG");

  // Determine transaction type string
  let transactionType = "sale";
  const modes = new Set(items.map((i) => i.mode));
  if (modes.size > 1) {
    transactionType = "mixed";
  } else if (modes.has("JASA")) {
    transactionType = "service";
  } else if (modes.has("SEWA")) {
    transactionType = "rental";
  }

  const createMutation = useMutation({
    mutationFn: async () => {
      // Backend mapping
      const payloadItems = items.map((item) => ({
        itemable_type:
          item.mode === "BARANG"
            ? "product"
            : item.mode === "JASA"
              ? "service"
              : "rental_item",
        itemable_id: item.rawId,
        quantity: item.quantity,
        unit_price: item.price,
        scheduled_start: item.mode === "JASA" ? item.scheduled_start : undefined,
        start_date: item.mode === "SEWA" ? item.start_date : undefined,
        end_date: item.mode === "SEWA" ? item.end_date : undefined,
      }));

      return await transactionsApi.createTransaction({
        customer_id: selectedCustomerId || null,
        type: transactionType,
        payment_method: paymentMethod,
        discount: discount || 0,
        tax: tax || 0,
        items: payloadItems,
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["rental-items"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Transaksi berhasil diproses!");
      setCompletedTransaction(res.data);
      clearCart();
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Gagal memproses transaksi.";
      setErrorMessage(msg);
      toast.error("Gagal transaksi: " + msg);
    },
  });

  const handleCheckout = () => {
    setErrorMessage("");

    if (items.length === 0) {
      setErrorMessage("Keranjang belanja masih kosong.");
      return;
    }

    if (hasRental && !selectedCustomerId) {
      setErrorMessage(
        "Identitas pelanggan wajib dipilih untuk transaksi penyewaan barang / aset."
      );
      return;
    }

    if (paymentMethod === "cash" && cashAmount < total) {
      setErrorMessage("Jumlah uang tunai yang dibayarkan masih kurang.");
      return;
    }

    createMutation.mutate();
  };

  const changeAmount = Math.max(0, cashAmount - total);

  const handleClose = () => {
    setCompletedTransaction(null);
    setErrorMessage("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[560px] bg-white dark:bg-slate-900 rounded-xl shadow-modal border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
        {completedTransaction ? (
          /* STRUK PEMBAYARAN SUKSES */
          <div className="space-y-5 py-2">
            <div className="text-center space-y-2">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto animate-in zoom-in-50 duration-300" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Transaksi Berhasil!
              </h2>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                ID Transaksi: {completedTransaction.id}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 space-y-3 text-sm border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center text-xs text-slate-500 border-b border-slate-200 dark:border-slate-700/60 pb-2">
                <span>Metode Pembayaran:</span>
                <span className="font-semibold uppercase text-slate-700 dark:text-slate-200">
                  {completedTransaction.payment_method}
                </span>
              </div>

              <div className="space-y-1.5">
                {completedTransaction.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-300 truncate max-w-[240px]">
                      {item.quantity}x (Item ID: {item.itemable_id.slice(0, 6)})
                    </span>
                    <span className="font-tabular tabular-nums font-medium text-slate-900 dark:text-slate-100">
                      {formatRupiah(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700/60 pt-2 space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Subtotal</span>
                  <span>{formatRupiah(completedTransaction.subtotal)}</span>
                </div>
                {completedTransaction.discount > 0 && (
                  <div className="flex justify-between text-xs text-rose-500">
                    <span>Diskon</span>
                    <span>-{formatRupiah(completedTransaction.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Pajak (PPN)</span>
                  <span>{formatRupiah(completedTransaction.tax)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-slate-100 pt-1">
                  <span>Total Bayar</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-tabular tabular-nums">
                    {formatRupiah(completedTransaction.total_amount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsPrintModalOpen(true)}
                className="inline-flex items-center gap-2 border-slate-300 dark:border-slate-700"
              >
                <Printer className="h-4 w-4 text-indigo-600" /> Cetak Struk Kasir
              </Button>
              <Button
                onClick={handleClose}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Selesai / Transaksi Baru
              </Button>
            </div>
          </div>
        ) : (
          /* FORM CHECKOUT & PEMBAYARAN */
          <>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Konfirmasi Pembayaran POS
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
                Pilih pelanggan, metode pembayaran, dan detail tanggal jika terdapat sewa/jasa.
              </DialogDescription>
            </DialogHeader>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">{errorMessage}</p>
              </div>
            )}

            <div className="space-y-4 my-2">
              {/* Pilihan Pelanggan */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  Pelanggan {hasRental && <span className="text-rose-500 font-bold">*Wajib untuk Sewa</span>}
                </label>
                <Select
                  value={selectedCustomerId || "walkin"}
                  onValueChange={(val) => setSelectedCustomerId(val === "walkin" ? null : val)}
                >
                  <SelectTrigger className="w-full h-10 rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                    <SelectValue placeholder="Pilih Pelanggan..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
                    <SelectItem value="walkin">Pelanggan Umum (Walk-in)</SelectItem>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} {c.phone ? `(${c.phone})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tanggal Sewa & Durasi Jasa (Jika ada) */}
              {items.map((item) => {
                if (item.mode === "SEWA") {
                  return (
                    <div key={item.id} className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2">
                      <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> Masa Sewa: {item.name}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] text-amber-700 dark:text-amber-400">Tgl Mulai</label>
                          <Input
                            type="date"
                            value={item.start_date || ""}
                            onChange={(e) => setItemDates(item.id, { start_date: e.target.value })}
                            className="h-8 text-xs bg-white dark:bg-slate-900"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-amber-700 dark:text-amber-400">Tgl Selesai</label>
                          <Input
                            type="date"
                            value={item.end_date || ""}
                            onChange={(e) => setItemDates(item.id, { end_date: e.target.value })}
                            className="h-8 text-xs bg-white dark:bg-slate-900"
                          />
                        </div>
                      </div>
                    </div>
                  );
                }

                if (item.mode === "JASA") {
                  return (
                    <div key={item.id} className="p-3 rounded-lg bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/60 space-y-2">
                      <p className="text-xs font-semibold text-violet-800 dark:text-violet-300 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> Waktu Layanan: {item.name}
                      </p>
                      <div>
                        <label className="text-[11px] text-violet-700 dark:text-violet-400">Jadwal Jam Mulai</label>
                        <Input
                          type="datetime-local"
                          value={item.scheduled_start ? item.scheduled_start.slice(0, 16) : ""}
                          onChange={(e) => setItemDates(item.id, { scheduled_start: new Date(e.target.value).toISOString() })}
                          className="h-8 text-xs bg-white dark:bg-slate-900"
                        />
                      </div>
                    </div>
                  );
                }

                return null;
              })}

              {/* Metode Pembayaran */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Metode Pembayaran
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash")}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === "cash"
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-semibold"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <Banknote className="h-4 w-4" /> Tunai
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("qris")}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === "qris"
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-semibold"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <QrCode className="h-4 w-4" /> QRIS
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("transfer")}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === "transfer"
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-semibold"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <CreditCard className="h-4 w-4" /> Transfer
                  </button>
                </div>
              </div>

              {/* Input Uang Tunai jika Cash */}
              {paymentMethod === "cash" && (
                <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Uang Diterima (Rp)
                    </label>
                    <button
                      type="button"
                      onClick={() => setCashAmount(total)}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Uang Pas
                    </button>
                  </div>
                  <Input
                    type="number"
                    value={cashAmount || ""}
                    onChange={(e) => setCashAmount(Number(e.target.value))}
                    placeholder="Contoh: 100000"
                    className="h-10 text-sm font-semibold font-tabular tabular-nums bg-white dark:bg-slate-900"
                  />
                  <div className="flex justify-between text-xs pt-1">
                    <span className="text-slate-500">Kembalian:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-tabular tabular-nums">
                      {formatRupiah(changeAmount)}
                    </span>
                  </div>
                </div>
              )}

              {/* Ringkasan Biaya */}
              <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal Items</span>
                  <span className="font-tabular tabular-nums">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Pajak (PPN 11%)</span>
                  <span className="font-tabular tabular-nums">{formatRupiah(tax)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-slate-100 border-t border-slate-200 dark:border-slate-700 pt-1.5">
                  <span>Total Tagihan</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-tabular tabular-nums">
                    {formatRupiah(total)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={createMutation.isPending}
              >
                Batal
              </Button>
              <Button
                onClick={handleCheckout}
                disabled={createMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Memproses...
                  </>
                ) : (
                  `Proses Bayar (${formatRupiah(total)})`
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>

      {/* RECEIPT PRINT MODAL */}
      <ReceiptPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        transaction={completedTransaction}
        cashAmount={cashAmount}
      />
    </Dialog>
  );
}
