"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Award,
  Calendar,
  DollarSign,
  QrCode,
  Share2,
  Copy,
  ExternalLink,
  ArrowLeft,
  CheckCircle,
  Building2,
  Check,
  RefreshCw,
} from "lucide-react";

export default function MerchantPassportPage() {
  const router = useRouter();
  const [merchant, setMerchant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadPassport() {
      const saved = localStorage.getItem("merchant_session");
      if (!saved) {
        router.push("/merchant/login");
        return;
      }

      try {
        const sessionMerchant = JSON.parse(saved);
        const res = await fetch(`/api/merchants?id=${sessionMerchant.id}`);
        const json = await res.json();
        if (json.success && json.data) {
          setMerchant(json.data);
        } else {
          setMerchant(sessionMerchant);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPassport();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-sm font-medium text-slate-600">Memuat Paspor Kredit...</p>
      </div>
    );
  }

  const slug = merchant?.slug || "warung-kopi-barokah";
  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/verify/${slug}`
    : `/verify/${slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalAnchoredRevenue = merchant?.anchors?.reduce(
    (acc: number, a: any) => acc + a.totalRevenue,
    0
  ) || 0;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 sm:my-6 sm:rounded-3xl sm:border sm:border-slate-200 sm:shadow-xl overflow-hidden flex flex-col p-4 sm:p-6 space-y-6">
      {/* HEADER NAV */}
      <div className="flex items-center justify-between">
        <Link
          href="/merchant"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-950 p-2 rounded-xl bg-white border border-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Kasir
        </Link>
        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 flex items-center gap-1">
          <CheckCircle className="w-3.5 h-3.5" /> Paspor Terverifikasi
        </span>
      </div>

      {/* REPUTATION DIGITAL CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6 shadow-2xl border border-slate-800 space-y-6">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-start justify-between relative z-10">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase">
              BNB Chain Verifiable Credential
            </span>
            <h1 className="text-2xl font-black text-white leading-tight">
              {merchant?.businessName}
            </h1>
            <p className="text-xs text-slate-300">
              {merchant?.ownerName} • {merchant?.city}
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center text-slate-950 font-black shadow-md">
            <Award className="w-7 h-7" />
          </div>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-2 gap-3 pt-2 relative z-10">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-0.5">
            <span className="text-[10px] text-slate-400 font-medium">Omzet Terkunci (On-Chain)</span>
            <div className="text-base font-black text-amber-400">
              Rp {totalAnchoredRevenue.toLocaleString("id-ID")}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-0.5">
            <span className="text-[10px] text-slate-400 font-medium">Status Kredensial</span>
            <div className="text-base font-black text-emerald-400">
              {merchant?.anchors?.length > 0 ? "Terverifikasi" : "Baru Terdaftar"}
            </div>
          </div>
        </div>

        {/* CUSTODIAL BSC ADDRESS */}
        <div className="pt-2 border-t border-slate-800/80 space-y-1 relative z-10">
          <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">
            Alamat Kredensial On-Chain (BSC)
          </span>
          <p className="text-xs font-mono text-slate-300 break-all bg-black/40 p-2.5 rounded-xl border border-white/5">
            {merchant?.merchantAddress}
          </p>
        </div>
      </div>

      {/* QR CODE SHARE CARD */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center space-y-4">
        <div className="space-y-1">
          <h2 className="text-base font-extrabold text-slate-900">
            Bagikan ke Analis Kredit Bank
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Tunjukkan QR Code ini atau kirimkan tautan agar analis bank dapat memvalidasi performa kas Anda di BSC.
          </p>
        </div>

        <div className="inline-block p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 shadow-inner">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareUrl)}`}
            alt="QR Code Paspor"
            className="w-40 h-40 mx-auto rounded-lg"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? "Tautan Tersalin!" : "Salin Tautan Paspor"}
          </button>

          <Link
            href={`/verify/${slug}`}
            className="py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <Building2 className="w-4 h-4" /> Buka Portal Bank
          </Link>
        </div>
      </div>

      {/* RIWAYAT BATCH */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
          Riwayat Penguncian Terverifikasi
        </h3>
        <div className="space-y-2">
          {!merchant?.anchors || merchant.anchors.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Belum ada penguncian on-chain untuk toko ini.</p>
          ) : (
            merchant.anchors.map((a: any) => (
              <div
                key={a.id}
                className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-800">
                    Rp {a.totalRevenue.toLocaleString("id-ID")} ({a.transactionCount} nota)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {new Date(a.anchoredAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <a
                  href={`https://testnet.bscscan.com/tx/${a.bscTxHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-600 hover:underline font-bold text-[11px] flex items-center gap-1"
                >
                  BscScan <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
