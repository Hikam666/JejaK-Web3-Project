"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Award,
  ExternalLink,
  ArrowLeft,
  CheckCircle,
  Building2,
  Check,
  RefreshCw,
  Download,
  Eye,
  X,
  Sparkles,
  Copy,
  Lock,
  Key,
} from "lucide-react";

export default function MerchantPassportPage() {
  const router = useRouter();
  const [merchant, setMerchant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedBatchIndex, setSelectedBatchIndex] = useState<number | null>(null);

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
        <p className="text-sm font-medium text-slate-600">Memuat Paspor Kredit &amp; Identitas On-Chain...</p>
      </div>
    );
  }

  const slug = merchant?.slug || "";
  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/verify/${slug}`
    : `/verify/${slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMasterSbt = async () => {
    try {
      const res = await fetch(`/api/nft/merchant/${slug}/sbt`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `JejaK-Master-SBT-${slug}.svg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error("Gagal mengunduh kartu SBT:", e);
    }
  };

  const handleDownloadBatchReceipt = async (index: number) => {
    try {
      const res = await fetch(`/api/nft/merchant/${slug}/batch/${index}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `JejaK-Batch-Receipt-${slug}-BATCH-${String(index).padStart(3, "0")}.svg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error("Gagal mengunduh struk batch:", e);
    }
  };

  const totalAnchoredRevenue = merchant?.anchors?.reduce(
    (acc: number, a: any) => acc + a.totalRevenue,
    0
  ) || 0;

  return (
    <div className="max-w-xl mx-auto min-h-screen bg-slate-50 sm:my-6 sm:rounded-3xl sm:border sm:border-slate-200 sm:shadow-xl overflow-hidden flex flex-col p-4 sm:p-6 space-y-6">
      {/* HEADER NAV */}
      <div className="flex items-center justify-between">
        <Link
          href="/merchant"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-950 p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Kasir
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/merchant"
            className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 flex items-center gap-1 transition-all"
            title="Buka Kasir untuk Ekspor Dompet & Private Key"
          >
            <Key className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Ekspor</span> Dompet
          </Link>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Terverifikasi BSC
          </span>
        </div>
      </div>

      {/* MASTER SOULBOUND TOKEN VISUAL NFT CARD */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Master Soulbound Token (ERC-5192)
            </span>
          </div>
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <Lock className="w-3 h-3 text-slate-400" /> Non-Transferable
          </span>
        </div>

        {/* Live Interactive NFT Visual */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-white transition-all hover:shadow-3xl">
          <img
            src={`/api/nft/merchant/${slug}/sbt`}
            alt="JejaK Master Soulbound Credit Passport"
            className="w-full h-auto object-contain select-none"
          />
        </div>

        {/* Quick Action Buttons for Master SBT */}
        <div className="flex gap-2">
          <button
            onClick={handleDownloadMasterSbt}
            className="flex-1 py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Download className="w-4 h-4 text-amber-600" />
            <span>Unduh Paspor (SVG HD)</span>
          </button>

          <a
            href={`/api/nft/metadata/1`}
            target="_blank"
            rel="noreferrer"
            className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
            title="Lihat Metadata Web3 (MetaMask Compatible)"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
            <span>Metadata JSON</span>
          </a>
        </div>
      </div>

      {/* SHARE TO BANK LENDER CARD */}
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

      {/* RIWAYAT BATCH DENGAN PREVIEW STRUK NFT */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Riwayat Batch Settlement (Layer 2 NFT)
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">
            Total: {merchant?.anchors?.length || 0} Batch
          </span>
        </div>

        <div className="space-y-2.5">
          {!merchant?.anchors || merchant.anchors.length === 0 ? (
            <p className="text-xs text-slate-400 italic p-4 bg-white rounded-2xl border border-dashed border-slate-200 text-center">
              Belum ada penguncian batch on-chain. Tekan Tutup Buku di kasir untuk menerbitkan batch receipt pertama!
            </p>
          ) : (
            merchant.anchors.map((a: any, idx: number) => {
              const batchNum = merchant.anchors.length - idx;
              return (
                <div
                  key={a.id}
                  className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:border-amber-300 transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-mono text-[11px] font-black">
                        #BATCH-{String(batchNum).padStart(3, "0")}
                      </span>
                      <span className="font-extrabold text-slate-900 text-sm">
                        Rp {a.totalRevenue.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {a.transactionCount} nota kasir &bull;{" "}
                      {new Date(a.anchoredAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedBatchIndex(batchNum)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-600" />
                      <span>Lihat NFT Struk</span>
                    </button>

                    <a
                      href={`https://testnet.bscscan.com/tx/${a.bscTxHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 text-xs font-semibold flex items-center gap-1 border border-slate-200"
                      title="Buka di BscScan"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL PREVIEW BATCH RECEIPT NFT */}
      {selectedBatchIndex !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-5 space-y-4 border border-slate-200 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-sm">
                  Batch Receipt NFT #BATCH-{String(selectedBatchIndex).padStart(3, "0")}
                </span>
              </div>
              <button
                onClick={() => setSelectedBatchIndex(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Render Batch NFT Visual */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md">
              <img
                src={`/api/nft/merchant/${slug}/batch/${selectedBatchIndex}`}
                alt="Batch Receipt NFT"
                className="w-full h-auto object-contain select-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleDownloadBatchReceipt(selectedBatchIndex)}
                className="flex-1 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Unduh Struk NFT (SVG)</span>
              </button>
              <button
                onClick={() => setSelectedBatchIndex(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
