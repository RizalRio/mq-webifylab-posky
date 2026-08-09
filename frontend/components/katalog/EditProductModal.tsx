"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "@/lib/api/products";
import { Loader2, AlertCircle, ShoppingBag, Wrench, PackageCheck } from "lucide-react";
import { toast } from "sonner";
import type { BusinessMode } from "@/types";

export interface UnifiedCatalogItem {
  id: string;
  sku: string;
  name: string;
  mode: BusinessMode;
  price: number;
  stock: number;
  rawType: "product" | "service" | "rental";
}

const formSchema = z.object({
  sku: z.string().min(3, "SKU / Kode minimal 3 karakter"),
  name: z.string().min(3, "Nama minimal 3 karakter"),
  mode: z.enum(["BARANG", "JASA", "SEWA"]),
  category: z.string().optional(),
  price: z.number().min(1, "Harga wajib diisi dan lebih dari 0"),
  cost_price: z.number().optional(),
  stock: z.number().min(0, "Stok tidak boleh bernilai minus"),
  min_stock_threshold: z.number().optional(),
  duration_minutes: z.number().optional(),
  description: z.string().optional(),
  deposit_amount: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const formatNumberWithDots = (num: number | string | undefined) => {
  if (num === undefined || num === null || num === "") return "";
  const cleanStr = String(num).replace(/\D/g, "");
  if (!cleanStr) return "";
  return new Intl.NumberFormat("id-ID").format(Number(cleanStr));
};

const parseFormattedNumber = (formattedStr: string) => {
  const cleanStr = formattedStr.replace(/\D/g, "");
  return cleanStr ? Number(cleanStr) : 0;
};

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: UnifiedCatalogItem | null;
}

export function EditProductModal({ isOpen, onClose, item }: EditProductModalProps) {
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sku: "",
      name: "",
      mode: "BARANG",
      category: "",
      price: 0,
      cost_price: 0,
      stock: 0,
      min_stock_threshold: 5,
      duration_minutes: 60,
      description: "",
      deposit_amount: 0,
    },
  });

  // Effect untuk mengisi ulang form ketika item yang di-edit berubah
  useEffect(() => {
    if (item) {
      form.reset({
        sku: item.sku,
        name: item.name,
        mode: item.mode,
        category: "",
        price: item.price,
        cost_price: Math.round(item.price * 0.7),
        stock: item.stock,
        min_stock_threshold: 5,
        duration_minutes: 60,
        description: "",
        deposit_amount: 100000,
      });
      setErrorMessage("");
    }
  }, [item, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (!item) return;

      if (item.rawType === "product") {
        return await productsApi.updateProduct(item.id, {
          sku: data.sku,
          name: data.name,
          category: data.category || undefined,
          stock: data.stock,
          min_stock_threshold: data.min_stock_threshold || 5,
          cost_price: data.cost_price || Math.round(data.price * 0.7),
          sell_price: data.price,
        });
      } else if (item.rawType === "service") {
        return await productsApi.updateService(item.id, {
          name: data.name,
          description: data.description || undefined,
          duration_minutes: data.duration_minutes || 60,
          price: data.price,
        });
      } else {
        return await productsApi.updateRentalItem(item.id, {
          serial_number: data.sku,
          name: data.name,
          category: data.category || undefined,
          daily_rate: data.price,
          deposit_amount: data.deposit_amount || 0,
        });
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["rental-items"] });
      toast.success(`Perubahan "${variables.name}" berhasil disimpan!`);
      setErrorMessage("");
      onClose();
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Gagal memperbarui data di backend.";
      setErrorMessage(msg);
      toast.error("Gagal memperbarui: " + msg);
    },
  });

  const onSubmit = (data: FormValues) => {
    setErrorMessage("");
    updateMutation.mutate(data);
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[540px] bg-white dark:bg-slate-900 rounded-xl shadow-modal border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Edit Data Produk & Layanan</span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                item.mode === "BARANG"
                  ? "bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300"
                  : item.mode === "JASA"
                    ? "bg-violet-100 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300"
                    : "bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300"
              }`}
            >
              {item.mode === "BARANG" ? (
                <ShoppingBag className="h-3 w-3" />
              ) : item.mode === "JASA" ? (
                <Wrench className="h-3 w-3" />
              ) : (
                <PackageCheck className="h-3 w-3" />
              )}
              {item.mode}
            </span>
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
            Perbarui informasi detail produk atau layanan di dalam katalog.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="mt-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
            <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">{errorMessage}</p>
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-3"
          >
            {/* Field Nama Produk */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">
                    {item.mode === "BARANG" ? "Nama Produk" : item.mode === "JASA" ? "Nama Layanan Jasa" : "Nama Aset Sewa"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Masukkan nama produk..."
                      className="w-full h-11 rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-rose-500" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Field SKU */}
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">
                      {item.mode === "SEWA" ? "Nomor Seri Aset" : "Kode SKU"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Kode SKU..."
                        className="w-full h-11 rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-rose-500" />
                  </FormItem>
                )}
              />

              {/* Kategori (Barang / Sewa) */}
              {item.mode !== "JASA" && (
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">
                        Kategori (Opsional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Contoh: Makanan / Elektronik"
                          className="w-full h-11 rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-rose-500" />
                    </FormItem>
                  )}
                />
              )}

              {/* Durasi Layanan (JASA) */}
              {item.mode === "JASA" && (
                <FormField
                  control={form.control}
                  name="duration_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">
                        Durasi Layanan (Menit)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="60"
                          className="w-full h-11 rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-tabular tabular-nums transition-colors"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-rose-500" />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Field Harga */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">
                      {item.mode === "BARANG" ? "Harga Jual (Rp)" : item.mode === "JASA" ? "Biaya Jasa (Rp)" : "Tarif Sewa/Hari (Rp)"}
                    </FormLabel>
                    <FormControl>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-slate-500 dark:text-slate-400 font-semibold text-sm select-none">
                          Rp
                        </span>
                        <Input
                          type="text"
                          placeholder="0"
                          value={formatNumberWithDots(field.value)}
                          onChange={(e) => field.onChange(parseFormattedNumber(e.target.value))}
                          className="w-full h-11 pl-10 rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-tabular tabular-nums font-semibold focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs text-rose-500" />
                  </FormItem>
                )}
              />

              {/* Cost Price (Khusus Barang) */}
              {item.mode === "BARANG" && (
                <FormField
                  control={form.control}
                  name="cost_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">
                        Harga Modal / HPP (Rp)
                      </FormLabel>
                      <FormControl>
                        <div className="relative flex items-center">
                          <span className="absolute left-3.5 text-slate-500 dark:text-slate-400 font-semibold text-sm select-none">
                            Rp
                          </span>
                          <Input
                            type="text"
                            placeholder="0"
                            value={formatNumberWithDots(field.value)}
                            onChange={(e) => field.onChange(parseFormattedNumber(e.target.value))}
                            className="w-full h-11 pl-10 rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-tabular tabular-nums transition-colors"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-rose-500" />
                    </FormItem>
                  )}
                />
              )}

              {/* Deposit Amount (Khusus Sewa) */}
              {item.mode === "SEWA" && (
                <FormField
                  control={form.control}
                  name="deposit_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">
                        Uang Deposit / Jaminan (Rp)
                      </FormLabel>
                      <FormControl>
                        <div className="relative flex items-center">
                          <span className="absolute left-3.5 text-slate-500 dark:text-slate-400 font-semibold text-sm select-none">
                            Rp
                          </span>
                          <Input
                            type="text"
                            placeholder="0"
                            value={formatNumberWithDots(field.value)}
                            onChange={(e) => field.onChange(parseFormattedNumber(e.target.value))}
                            className="w-full h-11 pl-10 rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-tabular tabular-nums transition-colors"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-rose-500" />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Field Stok Awal & Threshold (Khusus Barang) */}
            {item.mode === "BARANG" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">
                        Jumlah Stok
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          className="w-full h-11 rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-tabular tabular-nums transition-colors"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-rose-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="min_stock_threshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">
                        Batas Minimum Stok
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          className="w-full h-11 rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-tabular tabular-nums transition-colors"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-rose-500" />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Deskripsi (Khusus Jasa) */}
            {item.mode === "JASA" && (
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">
                      Deskripsi Layanan (Opsional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Rincian perbaikan atau skop pekerjaan..."
                        className="w-full h-11 rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-rose-500" />
                  </FormItem>
                )}
              />
            )}

            {/* Tombol Aksi */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-5">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={updateMutation.isPending}
                className="h-11 px-6 rounded-lg text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="h-11 px-6 rounded-lg bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white shadow-sm transition-all flex items-center gap-2"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menyimpan Perubahan...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
