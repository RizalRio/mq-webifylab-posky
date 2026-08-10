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
import { productsApi } from "@/lib/api/products";
import { stockLogsApi } from "@/lib/api/stockLogs";
import { Loader2, AlertCircle, Boxes, ArrowUpRight, ArrowDownLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface AdjustStockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdjustStockModal({ isOpen, onClose }: AdjustStockModalProps) {
  const queryClient = useQueryClient();
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [type, setType] = useState<"in" | "out" | "adjustment">("in");
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Fetch list produk untuk dropdown
  const { data: productsResponse } = useQuery({
    queryKey: ["products-select-stok"],
    queryFn: () => productsApi.getProducts({ per_page: 100 }),
    enabled: isOpen,
  });

  const products = productsResponse?.data || [];
  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const adjustMutation = useMutation({
    mutationFn: async () => {
      return await stockLogsApi.adjustStock({
        product_id: selectedProductId,
        type,
        quantity,
        notes: notes || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-logs"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Mutasi stok produk berhasil dicatat!");
      handleClose();
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Gagal menyesuaikan stok produk.";
      setErrorMessage(msg);
      toast.error("Gagal: " + msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!selectedProductId) {
      setErrorMessage("Silakan pilih produk terlebih dahulu.");
      return;
    }

    if (!quantity || quantity <= 0) {
      setErrorMessage("Kuantitas wajib bernilai lebih dari 0.");
      return;
    }

    adjustMutation.mutate();
  };

  const handleClose = () => {
    setSelectedProductId("");
    setType("in");
    setQuantity(1);
    setNotes("");
    setErrorMessage("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900 rounded-xl shadow-modal border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Boxes className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Penyesuaian Stok Manual
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
            Catat mutasi stok barang masuk (Restock), stok keluar, atau stok opname.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
            <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 my-2">
          {/* Select Produk */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Pilih Produk Target
            </label>
            <Select value={selectedProductId} onValueChange={(val) => setSelectedProductId(val || "")}>
              <SelectTrigger className="w-full h-11 rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                <SelectValue placeholder="Pilih produk..." />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 max-h-60">
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} (SKU: {p.sku}) — Stok: {p.stock}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Jenis Mutasi */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Jenis Mutasi Stok
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType("in")}
                className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  type === "in"
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <ArrowDownLeft className="h-4 w-4 text-emerald-500" /> Barang Masuk
              </button>

              <button
                type="button"
                onClick={() => setType("out")}
                className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  type === "out"
                    ? "border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-semibold"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <ArrowUpRight className="h-4 w-4 text-rose-500" /> Barang Keluar
              </button>

              <button
                type="button"
                onClick={() => setType("adjustment")}
                className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  type === "adjustment"
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <RefreshCw className="h-4 w-4 text-indigo-500" /> Set Stok Baru
              </button>
            </div>
          </div>

          {/* Kuantitas */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {type === "adjustment" ? "Jumlah Stok Akhir Baru" : "Jumlah Kuantitas Mutasi"}
            </label>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="h-11 font-semibold text-sm bg-slate-50 dark:bg-slate-800"
            />
            {selectedProduct && (
              <p className="text-[11px] text-slate-500">
                Stok sebelum mutasi: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedProduct.stock} unit</span>
              </p>
            )}
          </div>

          {/* Catatan */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Alasan / Catatan Keterangan
            </label>
            <Input
              placeholder="Contoh: Restock Supplier PT. Maju, Kerusakan fisik, Stok Opname..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-11 text-sm bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 mt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={adjustMutation.isPending}>
              Batal
            </Button>
            <Button
              type="submit"
              disabled={adjustMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2"
            >
              {adjustMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...
                </>
              ) : (
                "Simpan Mutasi Stok"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
