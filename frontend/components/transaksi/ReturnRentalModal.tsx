"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionsApi, type BackendTransaction, type ReturnRentalResponse } from "@/lib/api/transactions";
import { Loader2, AlertCircle, CheckCircle2, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface ReturnRentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: BackendTransaction | null;
}

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
};

export function ReturnRentalModal({ isOpen, onClose, transaction }: ReturnRentalModalProps) {
  const queryClient = useQueryClient();
  const [actualReturnDate, setActualReturnDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [condition, setCondition] = useState<string>("Baik (Tidak Ada Kerusakan)");
  const [notes, setNotes] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [returnResult, setReturnResult] = useState<ReturnRentalResponse | null>(null);

  const returnMutation = useMutation({
    mutationFn: async () => {
      if (!transaction) return;
      return await transactionsApi.returnRental(transaction.id, {
        actual_return_date: actualReturnDate,
        condition,
        notes,
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["rental-items"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Pengembalian sewa berhasil diproses!");
      if (res?.data) {
        setReturnResult(res.data);
      }
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Gagal memproses pengembalian sewa.";
      setErrorMessage(msg);
      toast.error("Gagal: " + msg);
    },
  });

  const handleReturn = () => {
    setErrorMessage("");
    if (!actualReturnDate) {
      setErrorMessage("Tanggal pengembalian aktual wajib diisi.");
      return;
    }
    returnMutation.mutate();
  };

  const handleClose = () => {
    setReturnResult(null);
    setErrorMessage("");
    onClose();
  };

  if (!transaction) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900 rounded-xl shadow-modal border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
        {returnResult ? (
          <div className="space-y-4 py-2">
            <div className="text-center space-y-2">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto animate-in zoom-in-50 duration-300" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Pengembalian Sewa Selesai!
              </h2>
              <p className="text-xs text-slate-500">
                Item aset sewa kini telah dikembalikan ke status **Tersedia (Ready)**.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 space-y-2 text-xs border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">Keterlambatan:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 font-tabular tabular-nums">
                  {returnResult.days_late} Hari
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Denda Keterlambatan:</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400 font-tabular tabular-nums">
                  {formatRupiah(returnResult.late_fee)}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 font-medium">Sisa Refund Deposit:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-tabular tabular-nums">
                  {formatRupiah(returnResult.deposit_refund)}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={handleClose} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Selesai
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-amber-500" />
                Pengembalian Item Sewa
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
                Proses pengembalian unit sewa untuk Faktur #{transaction.id.slice(0, 8)}.
              </DialogDescription>
            </DialogHeader>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">{errorMessage}</p>
              </div>
            )}

            <div className="space-y-4 my-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Tanggal Pengembalian Aktual
                </label>
                <Input
                  type="date"
                  value={actualReturnDate}
                  onChange={(e) => setActualReturnDate(e.target.value)}
                  className="h-10 text-sm bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Kondisi Unit Aset
                </label>
                <Input
                  placeholder="Contoh: Baik, Rusak Ringan, Tergores..."
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="h-10 text-sm bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Catatan Tambahan (Opsional)
                </label>
                <Input
                  placeholder="Catatan kelengkapan atau denda khusus..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="h-10 text-sm bg-slate-50 dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" onClick={handleClose} disabled={returnMutation.isPending}>
                Batal
              </Button>
              <Button
                onClick={handleReturn}
                disabled={returnMutation.isPending}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center gap-2"
              >
                {returnMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Memproses...
                  </>
                ) : (
                  "Proses Pengembalian"
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
