"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Store,
  Phone,
  MapPin,
  Percent,
  Receipt,
  Save,
  Loader2,
  Sparkles,
  CheckCircle2,
  Building2,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { settingsApi, type UpdateSettingsPayload } from "@/lib/api/settings";
import { toast } from "sonner";

export default function PengaturanPage() {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<UpdateSettingsPayload>({
    name: "",
    phone: "",
    address: "",
    tax_percentage: 11.0,
    receipt_footer: "",
    default_discount: 0,
  });

  // Fetch settings dari API backend
  const { data: settings, isLoading, isError } = useQuery({
    queryKey: ["tenant-settings"],
    queryFn: settingsApi.getSettings,
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        name: settings.name || "",
        phone: settings.phone || "",
        address: settings.address || "",
        tax_percentage: Number(settings.tax_percentage) || 11.0,
        receipt_footer: settings.receipt_footer || "Terima kasih telah berbelanja!",
        default_discount: Number(settings.default_discount) || 0,
      });
    }
  }, [settings]);

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: (payload: UpdateSettingsPayload) => settingsApi.updateSettings(payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["tenant-settings"] });
      queryClient.invalidateQueries({ queryKey: ["auth-me"] });
      toast.success("Pengaturan toko berhasil disimpan!");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Gagal menyimpan pengaturan.";
      toast.error("Gagal menyimpan: " + msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-2" />
        <p className="text-sm font-medium">Memuat pengaturan toko...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 animate-in fade-in duration-300 pb-12">
      {/* HEADER PAGE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            Pengaturan Toko & Kasir
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              <Store className="h-3.5 w-3.5" /> POS Configuration
            </span>
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Kelola profil usaha, alamat, persentase PPN/Pajak kasir, dan pesan cetak struk thermal.
          </p>
        </div>

        <Button
          type="submit"
          disabled={updateMutation.isPending}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2 shadow-sm"
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Memproses...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> Simpan Pengaturan
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SECTION 1: PROFIL & IDENTITAS TOKO */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-card space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-indigo-500" /> Profil & Identitas Toko
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Informasi dasar usaha yang akan tercetak pada header struk kasir dan faktur penjualan.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Nama Toko / Usaha <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Toko Berkah POS"
                  required
                  className="h-10 text-sm bg-slate-50 dark:bg-slate-800/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Nomor Telepon Toko
                </label>
                <Input
                  type="text"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Contoh: 0812-3456-7890"
                  className="h-10 text-sm bg-slate-50 dark:bg-slate-800/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Alamat Lengkap Toko
              </label>
              <textarea
                rows={3}
                value={formData.address || ""}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Masukkan alamat toko lengkap untuk dicetak pada struk thermal..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
              />
            </div>

            {/* Readonly Subdomain & Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400">Subdomain Tenant</label>
                <div className="h-9 px-3 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center text-xs font-mono text-slate-600 dark:text-slate-300">
                  {settings?.subdomain}.posky.com
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400">Model Bisnis POS</label>
                <div className="h-9 px-3 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center text-xs font-semibold uppercase text-indigo-600 dark:text-indigo-400">
                  {settings?.business_type} (Omnichannel)
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: PENGATURAN KASIR & STRUK */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-card space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Receipt className="h-4 w-4 text-indigo-500" /> Cetak Struk Thermal Kasir
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Kustomisasi ucapan dan catatan hukum di bagian bawah (*footer*) kertas struk thermal.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Pesan Footer Struk Thermal
              </label>
              <textarea
                rows={3}
                value={formData.receipt_footer || ""}
                onChange={(e) => setFormData({ ...formData, receipt_footer: e.target.value })}
                placeholder="Contoh: *** TERIMA KASIH *** Barang yang sudah dibeli tidak dapat ditukar/dikembalikan."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: KASIR & PERPAJAKAN (SIDEBAR RIGTH) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-card space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Percent className="h-4 w-4 text-indigo-500" /> Perpajakan (PPN)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pengaturan persentase pajak transaksi POS kasir.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Persentase Pajak PPN (%)
              </label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.tax_percentage ?? 11}
                  onChange={(e) => setFormData({ ...formData, tax_percentage: Number(e.target.value) })}
                  className="h-10 text-sm font-semibold pr-8 bg-slate-50 dark:bg-slate-800/50"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  %
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Tarif default PPN Indonesia saat ini adalah 11%. Pajak dihitung otomatis di POS.
              </p>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Diskon Default Toko (Rp)
              </label>
              <Input
                type="number"
                min="0"
                value={formData.default_discount ?? 0}
                onChange={(e) => setFormData({ ...formData, default_discount: Number(e.target.value) })}
                className="h-10 text-sm font-semibold bg-slate-50 dark:bg-slate-800/50"
              />
            </div>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/60 rounded-xl p-4 space-y-2 text-xs text-indigo-900 dark:text-indigo-300">
            <p className="font-bold flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">
              <Sparkles className="h-4 w-4 text-indigo-500" /> Tips Konfigurasi Kasir
            </p>
            <p className="leading-relaxed text-indigo-800/80 dark:text-indigo-300/80">
              Perubahan pada nama toko, persentase PPN, dan pesan footer struk akan langsung memengaruhi cetak struk kasir thermal 58mm/80mm di halaman POS secara realtime.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
