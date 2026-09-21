"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Store,
  Lock,
  Phone,
  User,
  MapPin,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Check,
  Sparkles,
} from "lucide-react";

export default function MerchantLoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">("register");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Login form
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPin, setLoginPin] = useState("");

  // Register form
  const [registerData, setRegisterData] = useState({
    businessName: "",
    businessCategory: "Kuliner",
    ownerName: "",
    phone: "",
    pin: "",
    city: "Jakarta Selatan",
  });

  const [activeSession, setActiveSession] = useState<any>(null);

  // Sesi awal login - Validasi apakah toko masih ada di database
  useEffect(() => {
    const saved = localStorage.getItem("merchant_session");
    if (saved) {
      try {
        const m = JSON.parse(saved);
        if (m && m.id) {
          fetch(`/api/merchants?id=${m.id}`)
            .then((res) => res.json())
            .then((json) => {
              if (json.success && json.data) {
                setActiveSession(json.data);
              } else {
                localStorage.removeItem("merchant_session");
                setActiveSession(null);
              }
            })
            .catch(() => {
              localStorage.removeItem("merchant_session");
              setActiveSession(null);
            });
        } else {
          localStorage.removeItem("merchant_session");
        }
      } catch {
        localStorage.removeItem("merchant_session");
      }
    }
  }, []);

  const handleClearActiveSession = () => {
    localStorage.removeItem("merchant_session");
    setActiveSession(null);
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/merchant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          phone: loginPhone,
          pin: loginPin,
        }),
      });

      const json = await res.json();
      if (json.success) {
        localStorage.setItem("merchant_session", JSON.stringify(json.data));
        router.push("/merchant");
      } else {
        setErrorMsg(json.error || "Nomor telepon atau PIN tidak valid");
      }
    } catch (err: any) {
      setErrorMsg("Gagal menghubungi server: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms) {
      setErrorMsg("Harap setujui Ketentuan Layanan & Privasi terlebih dahulu.");
      return;
    }
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/merchant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          ...registerData,
        }),
      });

      const json = await res.json();
      if (json.success) {
        localStorage.setItem("merchant_session", JSON.stringify(json.data));
        router.push("/merchant");
      } else {
        setErrorMsg(json.error || "Gagal mendaftarkan toko baru");
      }
    } catch (err: any) {
      setErrorMsg("Terjadi kesalahan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[88vh] bg-slate-100/50 flex flex-col justify-center items-center px-4 py-8 sm:py-12">
      {/* SPLIT BUBBLE CARD CONTAINER (Ref Image 2) */}
      <div className="w-full max-w-4xl bg-white rounded-[32px] border border-slate-200/90 shadow-bubble overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* LEFT COLUMN: OBSIDIAN DARK BUBBLE WITH BRAND & BULLETS */}
        <div className="bg-[#0B0F17] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Top Logo Crest in white rounded squircle */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="w-14 h-14 rounded-2xl bg-white p-1.5 shadow-md flex items-center justify-center">
              <Image
                src="/logo.svg"
                alt="JejaK Crest"
                width={48}
                height={48}
                className="w-full h-full object-contain rounded-xl"
                priority
              />
            </div>

            <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 bg-blue-950/60 px-3 py-1 rounded-full border border-blue-800/40">
              BNB Chain SBT
            </span>
          </div>

          {/* Bottom Headline & Bullet Points */}
          <div className="space-y-6 pt-10 sm:pt-16 relative z-10">
            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Gabung JejaK.
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-normal leading-relaxed">
                Portofolio reputasi kredit mikro, amankan transaksi kasir harian ke BNB Smart Chain:
              </p>
            </div>

            {/* Feature List with circular blue checks (Ref Image 2) */}
            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
                </div>
                <span>Catat kasir harian gratis tanpa biaya gas fee</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
                </div>
                <span>Paspor kredit Soulbound (ERC-5192) permanen</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
                </div>
                <span>Verifikasi 1-klik untuk analis kredit perbankan</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
                </div>
                <span>Terkoneksi langsung ke BNB Smart Chain Testnet</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PURE WHITE FORM BUBBLE */}
        <div className="p-8 sm:p-10 flex flex-col justify-between space-y-6 bg-white">
          
          {/* Active Session Alert if exists */}
          {activeSession && (
            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                  Sesi Toko Aktif
                </span>
                <span className="font-bold text-slate-900 truncate block max-w-[160px]">
                  {activeSession.businessName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.push("/merchant")}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors"
                >
                  Buka Kasir
                </button>
                <button
                  type="button"
                  onClick={handleClearActiveSession}
                  className="text-slate-400 hover:text-rose-600 text-xs font-semibold"
                >
                  Ganti
                </button>
              </div>
            </div>
          )}

          {/* Form Header */}
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-950 tracking-tight">
              {tab === "register" ? "Buat akun" : "Masuk kasir"}
            </h1>
            <div className="text-xs text-slate-500">
              {tab === "register" ? (
                <>
                  Sudah punya akun?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setTab("login");
                      setErrorMsg("");
                    }}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Login
                  </button>
                </>
              ) : (
                <>
                  Belum punya akun?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setTab("register");
                      setErrorMsg("");
                    }}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Daftar UMKM Baru
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Error alert */}
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" strokeWidth={1.75} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: FORM REGISTER */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Nama lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Nama kamu"
                  value={registerData.ownerName}
                  onChange={(e) => setRegisterData({ ...registerData, ownerName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Nama toko / usaha</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kopi Barokah"
                  value={registerData.businessName}
                  onChange={(e) => setRegisterData({ ...registerData, businessName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Nomor WhatsApp</label>
                  <input
                    type="tel"
                    required
                    placeholder="08123456789"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">PIN Kasir (6 Digit)</label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    placeholder="••••••"
                    value={registerData.pin}
                    onChange={(e) => setRegisterData({ ...registerData, pin: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm tracking-widest font-mono text-slate-900 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Checkbox agreement */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="agree-terms"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="agree-terms" className="text-[11px] text-slate-500 leading-tight select-none">
                  Saya setuju dengan Ketentuan Layanan &amp; Kebijakan Privasi JejaK
                </label>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={1.75} />
                    <span>Menerbitkan Dompet BSC...</span>
                  </>
                ) : (
                  <>
                    <span>Buat akun &rarr; terbitkan paspor</span>
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <span className="text-[10px] text-slate-400">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                  Langkah 1 dari 2 &mdash; dompet BNB Chain terbit otomatis di background
                </span>
              </div>
            </form>
          )}

          {/* TAB 2: FORM LOGIN */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Nomor WhatsApp / HP</label>
                <input
                  type="tel"
                  required
                  placeholder="081234567890"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">PIN Kasir (6 Digit)</label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  placeholder="••••••"
                  value={loginPin}
                  onChange={(e) => setLoginPin(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm tracking-widest font-mono text-slate-900 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={1.75} />
                    <span>Memverifikasi Akses...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Kasir Saya &rarr;</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer link */}
          <div className="pt-2 text-center">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-400 hover:text-slate-700"
            >
              &larr; Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
