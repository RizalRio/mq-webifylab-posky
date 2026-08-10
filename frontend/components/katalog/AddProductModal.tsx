"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 1. Skema Validasi Zod Lengkap Sesuai Model Backend (Product, Service, RentalItem)
const formSchema = z.object({
  sku: z.string().optional(),
  name: z.string().min(3, "Nama minimal 3 karakter"),
  mode: z.enum(["BARANG", "JASA", "SEWA"]),
  category: z.string().optional(),
  price: z.number().min(1, "Harga wajib diisi dan lebih dari 0"),
  cost_price: z.number().optional(),
  stock: z.number().optional(),
  min_stock_threshold: z.number().optional(),
  duration_minutes: z.number().optional(),
  description: z.string().optional(),
  deposit_amount: z.number().optional(),
}).superRefine((data, ctx) => {
  if (data.mode === "BARANG") {
    if (!data.sku || data.sku.trim().length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Kode SKU minimal 3 karakter untuk mode Barang",
        path: ["sku"],
      });
    }
    if (data.stock === undefined || data.stock < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Stok awal wajib diisi dan tidak boleh minus",
        path: ["stock"],
      });
    }
  } else if (data.mode === "SEWA") {
    if (!data.sku || data.sku.trim().length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nomor seri aset minimal 3 karakter untuk mode Sewa",
        path: ["sku"],
      });
    }
  }
});

type FormValues = z.infer<typeof formSchema>;

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "@/lib/api/products";
import { Loader2, AlertCircle, ShoppingBag, Wrench, PackageCheck, RefreshCw, Clock } from "lucide-react";
import { toast } from "sonner";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helper untuk format angka dengan titik ribuan (Contoh: 150.000)
const formatNumberWithDots = (num: number | string | undefined) => {
  if (num === undefined || num === null || num === "") return "";
  const cleanStr = String(num).replace(/\D/g, "");
  if (!cleanStr) return "";
  return new Intl.NumberFormat("id-ID").format(Number(cleanStr));
};

// Helper untuk ekstrak angka murni dari string terformat
const parseFormattedNumber = (formattedStr: string) => {
  const cleanStr = formattedStr.replace(/\D/g, "");
  return cleanStr ? Number(cleanStr) : 0;
};

// Helper untuk auto-generate SKU dari Nama Produk & Mode Bisnis
const generateSkuFromName = (name: string, mode: string) => {
  const prefix = mode === "BARANG" ? "BRD" : mode === "JASA" ? "SRV" : "RNT";
  if (!name || !name.trim()) {
    const randomNum = Math.floor(100 + Math.random() * 900);
    return `${prefix}-${randomNum}`;
  }

  const words = name.trim().split(/\s+/).filter(Boolean);
  let initials = "";
  if (words.length >= 3) {
    initials = (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
  } else if (words.length === 2) {
    initials = (words[0].slice(0, 2) + words[1][0]).toUpperCase();
  } else {
    initials = words[0].slice(0, 3).toUpperCase();
  }

  initials = initials.replace(/[^A-Z0-9]/g, "X");
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${initials}-${randomNum}`;
};

export function AddProductModal({ isOpen, onClose }: AddProductModalProps) {
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState("");
  const [isCustomSku, setIsCustomSku] = useState(false);

  // 2. Inisialisasi React Hook Form
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
      deposit_amount: 100000,
    },
  });

  const selectedMode = form.watch("mode");

  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (data.mode === "BARANG") {
        const costPrice = data.cost_price && data.cost_price > 0 ? data.cost_price : Math.round(data.price * 0.7);
        return await productsApi.createProduct({
          sku: data.sku!,
          name: data.name,
          category: data.category || undefined,
          stock: data.stock ?? 0,
          min_stock_threshold: data.min_stock_threshold || 5,
          cost_price: costPrice,
          sell_price: data.price,
        });
      } else if (data.mode === "JASA") {
        return await productsApi.createService({
          name: data.name,
          description: data.description || undefined,
          duration_minutes: data.duration_minutes || 60,
          price: data.price,
        });
      } else {
        return await productsApi.createRentalItem({
          serial_number: data.sku!,
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
      toast.success(`Berhasil menambahkan "${variables.name}" ke katalog!`);
      form.reset();
      setErrorMessage("");
      setIsCustomSku(false);
      onClose();
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Gagal menyimpan data ke backend.";
      setErrorMessage(msg);
      toast.error("Gagal menyimpan: " + msg);
    },
  });

  // Handler auto-generate SKU saat nama produk diketik
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>, fieldChange: (val: string) => void) => {
    const newName = e.target.value;
    fieldChange(newName);

    if (!isCustomSku) {
      const currentMode = form.getValues("mode") || "BARANG";
      const autoSku = generateSkuFromName(newName, currentMode);
      form.setValue("sku", autoSku, { shouldValidate: true });
    }
  };

  const handleRegenerateSku = () => {
    const currentName = form.getValues("name") || "";
    const currentMode = form.getValues("mode") || "BARANG";
    const autoSku = generateSkuFromName(currentName, currentMode);
    form.setValue("sku", autoSku, { shouldValidate: true });
    setIsCustomSku(false);
  };

  const onSubmit = (data: FormValues) => {
    setErrorMessage("");
    createMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[540px] bg-white dark:bg-slate-900 rounded-xl shadow-modal border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Tambah Data Katalog Baru
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
            Masukkan detail sesuai dengan mode bisnis (Barang, Layanan Jasa, atau Sewa).
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
            {/* Mode Bisnis Segmented Card Selector (BARANG, JASA, SEWA) */}
            <FormField
              control={form.control}
              name="mode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">
                    Mode Bisnis
                  </FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-3 gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          field.onChange("BARANG");
                          if (!isCustomSku) {
                            const currentName = form.getValues("name") || "";
                            form.setValue("sku", generateSkuFromName(currentName, "BARANG"));
                          }
                        }}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                          field.value === "BARANG"
                            ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20 font-semibold"
                            : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                        }`}
                      >
                        <ShoppingBag className={`h-5 w-5 ${field.value === "BARANG" ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`} />
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-semibold">Barang</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 hidden sm:inline">Fisik & Stok</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          field.onChange("JASA");
                          if (!isCustomSku) {
                            const currentName = form.getValues("name") || "";
                            form.setValue("sku", generateSkuFromName(currentName, "JASA"));
                          }
                        }}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                          field.value === "JASA"
                            ? "border-violet-500 bg-violet-50/60 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 ring-2 ring-violet-500/20 font-semibold"
                            : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                        }`}
                      >
                        <Wrench className={`h-5 w-5 ${field.value === "JASA" ? "text-violet-600 dark:text-violet-400" : "text-slate-400"}`} />
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-semibold">Jasa</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 hidden sm:inline">Layanan Jasa</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          field.onChange("SEWA");
                          if (!isCustomSku) {
                            const currentName = form.getValues("name") || "";
                            form.setValue("sku", generateSkuFromName(currentName, "SEWA"));
                          }
                        }}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                          field.value === "SEWA"
                            ? "border-amber-500 bg-amber-50/60 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/20 font-semibold"
                            : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                        }`}
                      >
                        <PackageCheck className={`h-5 w-5 ${field.value === "SEWA" ? "text-amber-600 dark:text-amber-400" : "text-slate-400"}`} />
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-semibold">Sewa</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 hidden sm:inline">Aset & Deposit</span>
                        </div>
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs text-rose-500" />
                </FormItem>
              )}
            />

            {/* Field Nama Produk/Jasa */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">
                    {selectedMode === "BARANG" ? "Nama Produk" : selectedMode === "JASA" ? "Nama Layanan Jasa" : "Nama Aset Sewa"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={selectedMode === "BARANG" ? "Contoh: Roti Gandum Utuh" : selectedMode === "JASA" ? "Contoh: Servis Mesin Kopi" : "Contoh: Proyektor Epson"}
                      className="w-full h-11 rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                      {...field}
                      onChange={(e) => handleNameChange(e, field.onChange)}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-rose-500" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* SKU / Seri (Auto-Generated) - Khusus Mode BARANG & SEWA */}
              {selectedMode !== "JASA" && (
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">
                          {selectedMode === "SEWA" ? "Nomor Seri Aset" : "Kode SKU"}
                        </FormLabel>
                        <button
                          type="button"
                          onClick={handleRegenerateSku}
                          className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                          title="Acak / Buat ulang SKU otomatis"
                        >
                          <RefreshCw className="h-3 w-3" /> Auto SKU
                        </button>
                      </div>
                      <FormControl>
                        <Input
                          placeholder={selectedMode === "SEWA" ? "Contoh: AST-RNT-123" : "Contoh: BRD-RGU-123"}
                          className="w-full h-11 rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setIsCustomSku(true);
                          }}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-rose-500" />
                    </FormItem>
                  )}
                />
              )}

              {/* Kategori (Untuk Barang / Sewa) */}
              {selectedMode !== "JASA" && (
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

              {/* Durasi Layanan (Khusus Mode JASA) */}
              {selectedMode === "JASA" && (
                <FormField
                  control={form.control}
                  name="duration_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" /> Durasi Layanan (Menit)
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

            {/* Field Harga & Stok */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Field Harga Jual / Tarif */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">
                      {selectedMode === "BARANG" ? "Harga Jual (Rp)" : selectedMode === "JASA" ? "Biaya Jasa (Rp)" : "Tarif Sewa/Hari (Rp)"}
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

              {/* Modal / Cost Price (Khusus Barang) */}
              {selectedMode === "BARANG" && (
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
              {selectedMode === "SEWA" && (
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
            {selectedMode === "BARANG" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">
                        Stok Awal
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
            {selectedMode === "JASA" && (
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
                disabled={createMutation.isPending}
                className="h-11 px-6 rounded-lg text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="h-11 px-6 rounded-lg bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white shadow-sm transition-all flex items-center gap-2"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Data"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
