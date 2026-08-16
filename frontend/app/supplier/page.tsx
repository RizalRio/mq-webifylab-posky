"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Truck,
  Plus,
  Search,
  Award,
  RefreshCw,
  Loader2,
  Phone,
  Mail,
  User,
  Sliders,
  Edit2,
  Trash2,
  CheckCircle2,
  Building2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { suppliersApi, type Supplier, type CreateSupplierPayload } from "@/lib/api/suppliers";
import { aiApi } from "@/lib/api/ai";
import { toast } from "sonner";

export default function SupplierPage() {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"suppliers" | "criteria">("suppliers");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [formData, setFormData] = useState<CreateSupplierPayload>({
    name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
  });

  // Query Suppliers
  const { data: suppliers, isLoading: isLoadingSuppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: suppliersApi.getSuppliers,
    staleTime: 30 * 1000,
  });

  // Query Criteria
  const { data: criteria, isLoading: isLoadingCriteria } = useQuery({
    queryKey: ["criteria"],
    queryFn: suppliersApi.getCriteria,
    staleTime: 60 * 1000,
  });

  // AHP Trigger Mutation
  const ahpMutation = useMutation({
    mutationFn: aiApi.triggerAhpCalculation,
    onSuccess: (res) => {
      toast.success(res.message || "Tugas AHP dikirimkan ke Python Worker!");
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["ahpRecommendations"] });
    },
    onError: (err: any) => {
      toast.error("Gagal memicu AHP: " + (err.response?.data?.message || err.message));
    },
  });

  // Supplier Save Mutation
  const saveSupplierMutation = useMutation({
    mutationFn: (data: CreateSupplierPayload) => {
      if (editingSupplier) {
        return suppliersApi.updateSupplier(editingSupplier.id, data);
      }
      return suppliersApi.createSupplier(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success(editingSupplier ? "Supplier berhasil diperbarui." : "Supplier baru ditambahkan.");
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast.error("Gagal menyimpan supplier: " + (err.response?.data?.message || err.message));
    },
  });

  // Supplier Delete Mutation
  const deleteSupplierMutation = useMutation({
    mutationFn: suppliersApi.deleteSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Supplier berhasil dihapus.");
    },
    onError: (err: any) => {
      toast.error("Gagal menghapus supplier: " + (err.response?.data?.message || err.message));
    },
  });

  const resetForm = () => {
    setEditingSupplier(null);
    setFormData({ name: "", contact_person: "", phone: "", email: "", address: "" });
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (supp: Supplier) => {
    setEditingSupplier(supp);
    setFormData({
      name: supp.name || "",
      contact_person: supp.contact_person || "",
      phone: supp.phone || "",
      email: supp.email || "",
      address: supp.address || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupplierMutation.mutate(formData);
  };

  const filteredSuppliers = suppliers?.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contact_person?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 pb-12">
      {/* HEADER PAGE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            Manajemen Supplier & AHP
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              <Truck className="h-3.5 w-3.5" /> DSS Supplier Ranking
            </span>
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Kelola data mitra supplier, kriteria perbandingan, dan jalankan kalkulasi AHP via Python AI Worker.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => ahpMutation.mutate()}
            disabled={ahpMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm"
          >
            {ahpMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Hitung Ulang AHP (Python Worker)
          </Button>

          <Button
            type="button"
            onClick={handleOpenCreate}
            className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" /> Tambah Supplier
          </Button>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("suppliers")}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "suppliers"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <Building2 className="h-4 w-4" /> Daftar Supplier & Skor Rangking
        </button>
        <button
          onClick={() => setActiveTab("criteria")}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "criteria"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <Sliders className="h-4 w-4" /> Kriteria & Bobot Matriks AHP
        </button>
      </div>

      {/* TAB CONTENT 1: DAFTAR SUPPLIER */}
      {activeTab === "suppliers" && (
        <div className="space-y-4">
          {/* SEARCH BAR */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Cari nama supplier atau kontak..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            />
          </div>

          {/* TABEL SUPPLIER */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-card">
            {isLoadingSuppliers ? (
              <div className="py-16 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-2" />
                <p className="text-xs">Memuat daftar supplier...</p>
              </div>
            ) : !filteredSuppliers || filteredSuppliers.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <Truck className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-medium">Belum ada data supplier.</p>
                <p className="text-xs text-slate-500">Klik &quot;Tambah Supplier&quot; untuk menginput mitra pemasok baru.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4 w-16 text-center">Rank</th>
                      <th className="py-3 px-4">Nama Supplier</th>
                      <th className="py-3 px-4">Kontak Person</th>
                      <th className="py-3 px-4">Telepon & Email</th>
                      <th className="py-3 px-4 text-center">Skor AHP</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredSuppliers.map((supp, index) => (
                      <tr
                        key={supp.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-4 text-center">
                          {supp.rank ? (
                            <span
                              className={`inline-flex h-7 w-7 items-center justify-center rounded-full font-bold text-xs font-tabular tabular-nums ${
                                supp.rank === 1
                                  ? "bg-amber-500 text-white"
                                  : supp.rank === 2
                                  ? "bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                                  : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                              }`}
                            >
                              {supp.rank}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono">-</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                          {supp.name}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                          {supp.contact_person || "-"}
                        </td>
                        <td className="py-3.5 px-4 space-y-0.5 text-slate-500">
                          {supp.phone && <div className="flex items-center gap-1"><Phone className="h-3 w-3" /> {supp.phone}</div>}
                          {supp.email && <div className="flex items-center gap-1"><Mail className="h-3 w-3" /> {supp.email}</div>}
                          {!supp.phone && !supp.email && "-"}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {supp.ahp_score !== undefined && supp.ahp_score !== null
                            ? Number(supp.ahp_score).toFixed(4)
                            : "Belum Dihitung"}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleOpenEdit(supp)}
                            className="h-8 w-8 text-slate-500 hover:text-indigo-600"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              if (confirm(`Hapus supplier ${supp.name}?`)) {
                                deleteSupplierMutation.mutate(supp.id);
                              }
                            }}
                            className="h-8 w-8 text-slate-500 hover:text-rose-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: KRITERIA AHP */}
      {activeTab === "criteria" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isLoadingCriteria ? (
              <div className="col-span-3 py-12 flex justify-center text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
              </div>
            ) : !criteria || criteria.length === 0 ? (
              <div className="col-span-3 p-6 text-center text-slate-400">
                Belum ada kriteria terdaftar di database.
              </div>
            ) : (
              criteria.map((crit) => (
                <div
                  key={crit.id}
                  className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                      {crit.code}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        crit.type === "cost"
                          ? "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
                          : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {crit.type}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {crit.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {crit.type === "cost"
                      ? "Makin kecil nilai mentah makin baik (Cost)"
                      : "Makin besar nilai mentah makin baik (Benefit)"}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs text-indigo-900 dark:text-indigo-300 space-y-2">
            <p className="font-bold flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-indigo-500" /> Informasi Perhitungan AHP Engine
            </p>
            <p className="leading-relaxed opacity-90">
              Setiap kali tombol <strong>Hitung Ulang AHP</strong> ditekan, backend mengirimkan instruksi ke <strong>Python Worker</strong> untuk mengeksekusi normalisasi matriks berpasangan, menguji rasio konsistensi ($CR &lt; 0.1$), dan menyimpan skor akhir supplier secara otomatis ke basis data PostgreSQL.
            </p>
          </div>
        </div>
      )}

      {/* DIALOG MODAL TAMBAH/EDIT SUPPLIER */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              {editingSupplier ? "Edit Supplier" : "Tambah Supplier Baru"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Isi data identitas mitra supplier untuk evaluasi AHP.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 my-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nama Supplier / Perusahaan <span className="text-rose-500">*</span>
              </label>
              <Input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: PT Alfa Makmur"
                className="h-10 text-xs bg-slate-50 dark:bg-slate-800/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Kontak Person
                </label>
                <Input
                  type="text"
                  value={formData.contact_person || ""}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  placeholder="Contoh: Andi"
                  className="h-10 text-xs bg-slate-50 dark:bg-slate-800/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No. Telepon
                </label>
                <Input
                  type="text"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0812-xxxx-xxxx"
                  className="h-10 text-xs bg-slate-50 dark:bg-slate-800/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email Supplier
              </label>
              <Input
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="supplier@domain.com"
                className="h-10 text-xs bg-slate-50 dark:bg-slate-800/50"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="text-xs">
                Batal
              </Button>
              <Button
                type="submit"
                disabled={saveSupplierMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs"
              >
                {saveSupplierMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan Supplier"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
