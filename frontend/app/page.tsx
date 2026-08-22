import Link from "next/link";
import { ArrowRight, BarChart3, Bot, Sparkles, Store, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/30">
            P
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
            POSKY
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Masuk
          </Link>
          <Link
            href="/login"
            className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md hover:shadow-xl hover:shadow-indigo-500/20 active:scale-95"
          >
            Coba Gratis
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/40 via-white to-white dark:from-indigo-900/20 dark:via-slate-950 dark:to-slate-950"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px] rounded-full -z-10"></div>

        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 text-indigo-600 dark:text-indigo-400 text-sm font-semibold mb-8 animate-in slide-in-from-bottom-4 duration-700 fade-in">
            <Sparkles className="h-4 w-4" />
            <span className="tracking-wide">AI-Powered POS System</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8 animate-in slide-in-from-bottom-6 duration-700 delay-100 fade-in max-w-4xl mx-auto leading-[1.1]">
            Kelola Bisnis Lebih Pintar dengan <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Kecerdasan Buatan</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-in slide-in-from-bottom-8 duration-700 delay-200 fade-in">
            POSKY bukan sekadar kasir biasa. Dilengkapi dengan AI Prophet untuk prediksi stok dan DSS AHP untuk rekomendasi supplier terbaik bagi UMKM Anda.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in slide-in-from-bottom-10 duration-700 delay-300 fade-in">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              Mulai Sekarang <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="h-14 w-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Store className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Omnichannel POS</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Dukung penjualan barang, jasa, hingga persewaan dalam satu sistem kasir modern yang intuitif.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="h-14 w-14 rounded-2xl bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Bot className="h-7 w-7 text-cyan-600 dark:text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">AI Forecasting</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Prediksi kapan stok barang Anda akan habis secara otomatis menggunakan model Machine Learning Prophet.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="h-14 w-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BarChart3 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">AHP Decision Support</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Sistem pendukung keputusan untuk menentukan supplier terbaik berdasarkan berbagai kriteria bobot.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
