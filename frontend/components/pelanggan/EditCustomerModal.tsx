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
import { customersApi, type BackendCustomer } from "@/lib/api/customers";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(3, "Nama pelanggan minimal 3 karakter"),
  phone: z.string().optional(),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  address: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: BackendCustomer | null;
}

export function EditCustomerModal({ isOpen, onClose, customer }: EditCustomerModalProps) {
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
    },
  });

  useEffect(() => {
    if (customer) {
      form.reset({
        name: customer.name || "",
        phone: customer.phone || "",
        email: customer.email || "",
        address: customer.address || "",
      });
      setErrorMessage("");
    }
  }, [customer, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (!customer) return;
      return await customersApi.updateCustomer(customer.id, {
        name: data.name,
        phone: data.phone || undefined,
        email: data.email || undefined,
        address: data.address || undefined,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success(`Perubahan pelanggan "${variables.name}" berhasil disimpan!`);
      setErrorMessage("");
      onClose();
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Gagal memperbarui data pelanggan di backend.";
      setErrorMessage(msg);
      toast.error("Gagal memperbarui: " + msg);
    },
  });

  const onSubmit = (data: FormValues) => {
    setErrorMessage("");
    updateMutation.mutate(data);
  };

  if (!customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900 rounded-xl shadow-modal border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Edit Data Pelanggan
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
            Perbarui data rincian kontak dan profil pelanggan.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="mt-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
            <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">{errorMessage}</p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">
                    Nama Lengkap Pelanggan
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Masukkan nama pelanggan..."
                      className="w-full h-11 rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-rose-500" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">
                      Nomor Telepon / WA
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contoh: 081234567890"
                        className="w-full h-11 rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-rose-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">
                      Alamat Email (Opsional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="pelanggan@email.com"
                        className="w-full h-11 rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-rose-500" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">
                    Alamat Lengkap (Opsional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Alamat pelanggan..."
                      className="w-full h-11 rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-rose-500" />
                </FormItem>
              )}
            />

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
