"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  Zap,
  Fuel,
  ExternalLink,
  RefreshCw,
  Layers,
  Database,
  ShieldCheck,
  TrendingUp,
  LogOut,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  Gauge,
  Wallet,
} from "lucide-react";

export default function AdminGasMonitorPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Cek Sesi Admin
  useEffect(() => {
    const isAuth = localStorage.getItem("admin_authenticated");
    if (!isAuth) {
      router.push("/admin/login");
      return;
    }
    fetchMetrics();
  }, [router]);

  const fetchMetrics = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/admin/metrics", { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Failed to load admin metrics:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAdminLogout = () => {
    if (confirm("Keluar dari Platform Operator Console?")) {
      localStorage.removeItem("admin_authenticated");
      router.push("/admin/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] bg-white flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-blue-700 animate-spin" strokeWidth={1.75} />
        <p className="text-xs font-semibold text-slate-500">
          Menghubungkan ke Gas Tank Relayer BSC...
        </p>
      </div>
    );
  }

  const balanceNumber = parseFloat(data?.relayer?.balance || "0");
  const maxGasEstimate = 0.5; // Benchmark 0.5 BNB
  const gasPercentage = Math.min(100, Math.round((balanceNumber / maxGasEstimate) * 100));

  return (
    <div className="bg-white min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* TOP BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-blue-700 text-[11px] font-bold uppercase tracking-widest font-mono">
              <Gauge className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>PLATFORM OPERATOR CONSOLE</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                RELAYER ONLINE (BSC Testnet)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Gas Tank &amp; Relayer Infrastructure
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              Sistem relayer otomatis yang mensponsori seluruh biaya gas on-chain transaksi kasir UMKM secara gasless.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={fetchMetrics}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-blue-700" : ""}`} strokeWidth={1.75} />
              <span>{refreshing ? "Memperbarui..." : "Refresh"}</span>
            </button>

            <button
              onClick={handleAdminLogout}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100 text-slate-700 hover:text-rose-600 hover:bg-rose-50 font-bold text-xs border border-slate-200 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* MASTER GAS TANK BUBBLE CARD */}
        <div className="bg-slate-950 text-white rounded-[28px] p-6 sm:p-8 border border-slate-800 shadow-bubble space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black shadow-sm">
                <Fuel className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block font-mono">
                  RELAYER MASTER WALLET (SPONSOR GAS)
                </span>
                <p className="text-xs font-mono text-slate-300 break-all">{data?.relayer?.address}</p>
              </div>
            </div>

            <a
              href={data?.relayer?.explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-blue-400 hover:text-blue-300 hover:bg-slate-800 transition-colors shrink-0"
            >
              <span>Lihat di BscScan</span>
              <ExternalLink className="w-3 h-3" strokeWidth={1.75} />
            </a>
          </div>

          {/* Gas Balance & Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold">Sisa Saldo Kasir Gas Tank</span>
              <span className="text-white text-xl font-black font-mono">{data?.relayer?.balance} tBNB</span>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${gasPercentage}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Estimasi Kapasitas: ~{Math.floor(balanceNumber / 0.0001)} Transaksi Kasir</span>
              <span>Cadangan Aman (Buffer OK)</span>
            </div>
          </div>
        </div>

        {/* NETWORK TOTALS (3 METRIC CARDS) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-antigravity space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Total Batch Anchored
              </span>
              <Layers className="w-4 h-4 text-blue-700" strokeWidth={1.75} />
            </div>
            <div className="text-2xl font-black font-mono text-slate-950">
              {data?.system?.totalBatches || 0}
            </div>
            <p className="text-[11px] text-slate-500">Kumpulan struk kasir terkunci permanen di BSC</p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-antigravity space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Total Nilai Omzet Dilindungi
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-600" strokeWidth={1.75} />
            </div>
            <div className="text-2xl font-black font-mono text-slate-950">
              Rp {(data?.system?.totalProtectedRevenue || 0).toLocaleString("id-ID")}
            </div>
            <p className="text-[11px] text-slate-500">Nilai perputaran kas riil UMKM terakreditasi</p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-antigravity space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Total Struk Tercatat
              </span>
              <Database className="w-4 h-4 text-slate-700" strokeWidth={1.75} />
            </div>
            <div className="text-2xl font-black font-mono text-slate-950">
              {data?.system?.totalSlips || 0} Nota
            </div>
            <p className="text-[11px] text-slate-500">Bukti transaksi tersimpan dalam hash canonical</p>
          </div>
        </div>

        {/* TRANSACTION AUDIT TABLE */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-antigravity p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-950 uppercase tracking-wider">
                Live Transaction Audit Feed
              </h2>
              <p className="text-xs text-slate-500">Log transaksi penguncian batch terbaru yang disubsidi oleh relayer</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-bold">
              {data?.recentTransactions?.length || 0} Terkini
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <th className="pb-3 px-3">Tx Hash (BSC)</th>
                  <th className="pb-3 px-3">Target Merchant</th>
                  <th className="pb-3 px-3">Gas Fee (tBNB)</th>
                  <th className="pb-3 px-3">Stempel Waktu</th>
                  <th className="pb-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {data?.recentTransactions && data.recentTransactions.length > 0 ? (
                  data.recentTransactions.map((tx: any, idx: number) => (
                    <tr key={tx.hash || idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 text-blue-700 font-medium">
                        <a
                          href={`https://testnet.bscscan.com/tx/${tx.hash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline inline-flex items-center gap-1"
                        >
                          <span>{tx.hash ? `${tx.hash.slice(0, 10)}...${tx.hash.slice(-6)}` : "-"}</span>
                          <ExternalLink className="w-2.5 h-2.5" strokeWidth={1.75} />
                        </a>
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        {tx.merchantAddress ? `${tx.merchantAddress.slice(0, 6)}...${tx.merchantAddress.slice(-4)}` : "-"}
                      </td>
                      <td className="py-3 px-3 text-slate-900 font-bold">
                        {tx.gasFee || "0.0001"} tBNB
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {tx.timestamp ? new Date(tx.timestamp).toLocaleString("id-ID") : "Baru saja"}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold font-sans">
                          <CheckCircle2 className="w-3 h-3" strokeWidth={2} />
                          CONFIRMED
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400 italic">
                      Belum ada log transaksi on-chain.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
