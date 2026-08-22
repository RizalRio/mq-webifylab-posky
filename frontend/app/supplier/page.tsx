"use client";

import { useState, useEffect, useMemo } from "react";
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
  GitCompare,
  ClipboardList,
  Save,
  Info,
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
import { suppliersApi, type Supplier, type CreateSupplierPayload, type CriterionComparisonInput, type SupplierEvaluationInput } from "@/lib/api/suppliers";
import { aiApi } from "@/lib/api/ai";
import { toast } from "sonner";
const EvaluationInputCell = ({ 
  criterionName, 
  value, 
  onChange 
}: { 
  criterionName: string, 
  value: number | "", 
  onChange: (val: number | "") => void 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState(value === "" ? "" : value.toString());

  const nameLower = criterionName.toLowerCase();
  const isCurrency = nameLower.includes("harga") || nameLower.includes("biaya") || nameLower.includes("cost");
  const isTime = nameLower.includes("waktu") || nameLower.includes("lama") || nameLower.includes("pengiriman") || nameLower.includes("hari");

  useEffect(() => {
    if (!isFocused) {
      setLocalValue(value === "" ? "" : Number(value).toString());
    }
  }, [value, isFocused]);

  const displayValue = () => {
    if (isFocused) return localValue;
    if (value === "") return "";
    
    const num = Number(value);
    if (isCurrency) {
      return "Rp " + num.toLocaleString("id-ID");
    }
    if (isTime) {
      return num.toString() + " Hari";
    }
    return num.toString();
  };

  return (
    <Input
      type={isFocused ? "number" : "text"}
      step="any"
      placeholder="0"
      value={displayValue()}
      onFocus={() => setIsFocused(true)}
      onBlur={() => {
        setIsFocused(false);
        const parsed = parseFloat(localValue);
        if (!isNaN(parsed)) {
          onChange(parsed);
        } else {
          onChange("");
        }
      }}
      onChange={(e) => {
        setLocalValue(e.target.value);
        const parsed = parseFloat(e.target.value);
        onChange(isNaN(parsed) ? "" : parsed);
      }}
      className="h-10 w-32 text-center mx-auto text-sm font-semibold bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
    />
  );
};

export default function SupplierPage() {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"suppliers" | "criteria" | "comparisons" | "evaluations">("suppliers");
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

  const [comparisonInputs, setComparisonInputs] = useState<CriterionComparisonInput[]>([]);
  const [evaluationInputs, setEvaluationInputs] = useState<SupplierEvaluationInput[]>([]);

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

  // Query Comparisons
  const { data: comparisons, isLoading: isLoadingComparisons } = useQuery({
    queryKey: ["comparisons"],
    queryFn: suppliersApi.getComparisons,
  });

  // Query Evaluations
  const { data: evaluations, isLoading: isLoadingEvaluations } = useQuery({
    queryKey: ["evaluations"],
    queryFn: suppliersApi.getEvaluations,
  });

  useEffect(() => {
    if (comparisons) {
      setComparisonInputs(comparisons.map(c => ({ criterion_id_1: c.criterion_id_1, criterion_id_2: c.criterion_id_2, value: c.value })));
    }
  }, [comparisons]);

  useEffect(() => {
    if (evaluations) {
      setEvaluationInputs(evaluations.map(e => ({ supplier_id: e.supplier_id, criterion_id: e.criterion_id, raw_value: e.raw_value })));
    }
  }, [evaluations]);

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

  // Save Comparisons Mutation
  const saveComparisonsMutation = useMutation({
    mutationFn: suppliersApi.saveComparisonsBulk,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comparisons"] });
      toast.success("Perbandingan Kriteria berhasil disimpan.");
    },
    onError: (err: any) => {
      toast.error("Gagal menyimpan perbandingan: " + (err.response?.data?.message || err.message));
    },
  });

  // Save Evaluations Mutation
  const saveEvaluationsMutation = useMutation({
    mutationFn: suppliersApi.saveEvaluationsBulk,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluations"] });
      toast.success("Evaluasi Supplier berhasil disimpan.");
    },
    onError: (err: any) => {
      toast.error("Gagal menyimpan evaluasi: " + (err.response?.data?.message || err.message));
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
        <button
          onClick={() => setActiveTab("comparisons")}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "comparisons"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <GitCompare className="h-4 w-4" /> Perbandingan Kriteria
        </button>
        <button
          onClick={() => setActiveTab("evaluations")}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "evaluations"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <ClipboardList className="h-4 w-4" /> Evaluasi Supplier
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

      {/* TAB CONTENT 3: PERBANDINGAN KRITERIA */}
      {activeTab === "comparisons" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-card">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <GitCompare className="h-5 w-5 text-indigo-500" /> Matriks Perbandingan Berpasangan
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Beri nilai tingkat kepentingan kriteria kiri terhadap kriteria kanan. (1 = Sama penting, 3 = Sedikit lebih penting, 5 = Lebih penting, 7 = Sangat penting, 9 = Mutlak lebih penting).
            </p>
            
            {isLoadingCriteria || isLoadingComparisons ? (
              <div className="py-12 flex justify-center text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
              </div>
            ) : (!criteria || criteria.length < 2) ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                Minimal butuh 2 kriteria untuk melakukan perbandingan.
              </div>
            ) : (
              <div className="space-y-4">
                {criteria.map((c1, i) => 
                  criteria.slice(i + 1).map((c2) => {
                    const existingVal = comparisonInputs.find(c => c.criterion_id_1 === c1.id && c.criterion_id_2 === c2.id)?.value || 1;
                    return (
                      <div key={`${c1.id}-${c2.id}`} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <div className="flex-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {c1.name} <span className="text-xs text-slate-400 font-normal">({c1.code})</span>
                        </div>
                        <div className="w-full md:w-64">
                          <select 
                            value={existingVal}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setComparisonInputs(prev => {
                                const newArr = prev.filter(p => !(p.criterion_id_1 === c1.id && p.criterion_id_2 === c2.id));
                                return [...newArr, { criterion_id_1: c1.id, criterion_id_2: c2.id, value: val }];
                              });
                            }}
                            className="w-full h-9 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                          >
                            <option value={9}>9 - Mutlak Lebih Penting (Kiri)</option>
                            <option value={7}>7 - Sangat Penting (Kiri)</option>
                            <option value={5}>5 - Lebih Penting (Kiri)</option>
                            <option value={3}>3 - Sedikit Lebih Penting (Kiri)</option>
                            <option value={1}>1 - Sama Penting</option>
                            <option value={1/3}>1/3 - Sedikit Lebih Penting (Kanan)</option>
                            <option value={1/5}>1/5 - Lebih Penting (Kanan)</option>
                            <option value={1/7}>1/7 - Sangat Penting (Kanan)</option>
                            <option value={1/9}>1/9 - Mutlak Lebih Penting (Kanan)</option>
                          </select>
                        </div>
                        <div className="flex-1 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {c2.name} <span className="text-xs text-slate-400 font-normal">({c2.code})</span>
                        </div>
                      </div>
                    );
                  })
                )}
                
                <div className="pt-4 flex justify-end">
                  <Button 
                    onClick={() => saveComparisonsMutation.mutate(comparisonInputs)}
                    disabled={saveComparisonsMutation.isPending}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs"
                  >
                    {saveComparisonsMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Simpan Perbandingan
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: EVALUASI SUPPLIER */}
      {activeTab === "evaluations" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-card overflow-x-auto">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-indigo-500" /> Input Matriks Evaluasi Supplier
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Masukkan nilai asli (mentah) untuk masing-masing kriteria pada tiap supplier.
            </p>

            <div className="mb-6 p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-lg text-xs text-indigo-900 dark:text-indigo-300 flex items-start gap-3">
              <Info className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-indigo-700 dark:text-indigo-400">Panduan Pengisian Nilai Evaluasi (Matriks Keputusan)</p>
                <p className="leading-relaxed opacity-90">
                  Isikan angka riil (sebenarnya) dari masing-masing kriteria. Sistem AHP akan melakukan normalisasi secara otomatis.
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 opacity-90">
                  <li><strong>Kriteria Harga:</strong> Masukkan harga riil (misal: <code>150000</code>). Karena tipenya <em>Cost</em>, sistem akan menganggap angka yang lebih kecil sebagai yang terbaik.</li>
                  <li><strong>Kriteria Waktu Pengiriman:</strong> Masukkan dalam hari (misal: <code>3</code>).</li>
                  <li><strong>Kriteria Kualitas/Pelayanan:</strong> Jika kualitatif, Anda bisa menggunakan skala angka sendiri (misal: <code>1-10</code> atau <code>1-100</code>). Semakin tinggi angka, semakin baik (<em>Benefit</em>).</li>
                </ul>
              </div>
            </div>

            {isLoadingCriteria || isLoadingSuppliers || isLoadingEvaluations ? (
              <div className="py-12 flex justify-center text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
              </div>
            ) : (!suppliers || suppliers.length === 0 || !criteria || criteria.length === 0) ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                Data supplier atau kriteria tidak mencukupi untuk dievaluasi.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="ring-1 ring-slate-200 dark:ring-slate-800 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-4 px-6 min-w-[200px] sticky left-0 bg-slate-100 dark:bg-slate-800/80 z-10 shadow-[1px_0_0_0_theme(colors.slate.200)] dark:shadow-[1px_0_0_0_theme(colors.slate.800)]">
                          Nama Supplier
                        </th>
                        {criteria.map(c => (
                          <th key={c.id} className="py-4 px-4 text-center group">
                            <div className="flex flex-col items-center gap-1">
                              <span>{c.name}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${
                                c.type === 'cost' 
                                  ? 'bg-rose-100/80 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400' 
                                  : 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                              }`}>
                                {c.type}
                              </span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900/50">
                      {suppliers.map((supp, index) => (
                        <tr key={supp.id} className="hover:bg-indigo-50/40 dark:hover:bg-indigo-900/20 transition-colors group">
                          <td className="py-3 px-6 font-semibold text-slate-900 dark:text-slate-100 sticky left-0 bg-white dark:bg-slate-900/95 group-hover:bg-indigo-50/40 dark:group-hover:bg-indigo-900/20 shadow-[1px_0_0_0_theme(colors.slate.100)] dark:shadow-[1px_0_0_0_theme(colors.slate.800/60)] z-10 transition-colors flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px]">
                              {index + 1}
                            </div>
                            {supp.name}
                          </td>
                          {criteria.map(crit => {
                            const existingVal = evaluationInputs.find(e => e.supplier_id === supp.id && e.criterion_id === crit.id)?.raw_value ?? "";
                            return (
                              <td key={crit.id} className="py-3 px-4">
                                <EvaluationInputCell
                                  criterionName={crit.name}
                                  value={existingVal}
                                  onChange={(val) => {
                                    setEvaluationInputs(prev => {
                                      const newArr = prev.filter(p => !(p.supplier_id === supp.id && p.criterion_id === crit.id));
                                      if (val !== "") {
                                        newArr.push({ supplier_id: supp.id, criterion_id: crit.id, raw_value: val });
                                      }
                                      return newArr;
                                    });
                                  }}
                                />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="pt-4 flex justify-end">
                  <Button 
                    onClick={() => saveEvaluationsMutation.mutate(evaluationInputs)}
                    disabled={saveEvaluationsMutation.isPending}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs"
                  >
                    {saveEvaluationsMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Simpan Evaluasi
                  </Button>
                </div>
              </div>
            )}
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
