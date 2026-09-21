"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Lock, ArrowRight, RefreshCw, KeyRound, ArrowLeft, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("admin_authenticated", "true");
        router.push("/admin");
      } else {
        setErrorMsg(data.error || "Kunci otorisasi administrator tidak valid");
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMsg("Gagal menghubungkan ke server otorisasi");
      setLoading(false);
    }
  };

  const fillDefaultPassword = () => {
    setPassword("admin123");
    setErrorMsg("");
  };

  return (
    <div className="min-h-[88vh] bg-slate-50/60 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Top Emblem */}
        <div className="text-center mb-6 space-y-2">
          <div className="w-12 h-12 rounded-2xl p-1 bg-white border border-slate-200 shadow-sm mx-auto flex items-center justify-center">
            <Image
              src="/logo.svg"
              alt="JejaK Logo"
              width={40}
              height={40}
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <h1 className="text-xl font-black tracking-tight text-slate-950">
            Platform Operator Console
          </h1>
          <p className="text-xs text-slate-500">
            Akses pemantauan gas tank relayer dan audit transaksi on-chain BSC
          </p>
        </div>

        {/* Floating Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-antigravity p-6 sm:p-7 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" strokeWidth={1.75} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Admin Secret Key / Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" strokeWidth={1.75} />
                <input
                  type="password"
                  required
                  placeholder="Masukkan password admin"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
              <span>Password Demo: <strong className="font-mono text-slate-900">admin123</strong></span>
              <button
                type="button"
                onClick={fillDefaultPassword}
                className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[10px] border border-blue-200/60 transition-colors"
              >
                Isi Otomatis
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={1.75} />
                  <span>Mengautentikasi...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Operator Console</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 text-center">
            <Link href="/" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-semibold">
              <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>Kembali ke Beranda</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
