"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";

import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/store/useAuthStore";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AlertCircle, Loader2, ShieldCheck, UserCheck } from "lucide-react";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z
    .string()
    .min(1, "Password wajib diisi")
    .min(6, "Password minimal 6 karakter"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const { errors } = form.formState;

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      setAuth(response.data.user, response.data.token);
      router.push("/");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Terjadi kesalahan saat login. Coba lagi.";
      setErrorMessage(message);
      console.error("Detail Error Login:", error);
    },
  });

  const onSubmit = (data: LoginForm) => {
    setErrorMessage("");
    loginMutation.mutate(data);
  };

  const handleDemoLogin = (email: string, role: string) => {
    form.setValue("email", email);
    form.setValue("password", "password123");
    setErrorMessage("");
    loginMutation.mutate({ email, password: "password123" });
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300 transition-colors">
      <div className="p-8 sm:p-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight mb-2">
            POSKY
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Masuk ke sistem kasir & analitik UMKM
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-700 dark:text-rose-300 font-medium">
              {errorMessage}
            </p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="admin@posky.com"
                      className="h-12 rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100 font-medium"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-rose-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">
                    Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="h-12 rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100 font-medium"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-rose-500" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-12 mt-2 rounded-xl bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-semibold text-base transition-all shadow-sm"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>
        </Form>

        {/* DEMO 1-CLICK LOGIN HELPER */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
          <p className="text-xs text-center text-slate-400 font-medium">
            Uji Coba Pintas (Demo Accounts)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin("admin@posky.com", "Admin")}
              disabled={loginMutation.isPending}
              className="p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-indigo-100 transition-all"
            >
              <ShieldCheck className="h-4 w-4" /> Admin Demo
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("kasir@posky.com", "Kasir")}
              disabled={loginMutation.isPending}
              className="p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition-all"
            >
              <UserCheck className="h-4 w-4" /> Kasir Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
