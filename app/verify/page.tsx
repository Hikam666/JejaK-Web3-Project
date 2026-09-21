"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  Search,
  Store,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  RefreshCw,
  Award,
  DollarSign,
  MapPin,
  Tag,
  ArrowLeft,
  Lock,
  Layers,
  Sparkles,
  ChevronRight,
  Users,
  Wallet,
} from "lucide-react";

export default function PublicLenderDirectoryPage() {
  const [merchants, setMerchants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const loadMerchants = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/merchants");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setMerchants(json.data);
      }
    } catch (err) {
      console.error("Gagal memuat direktori merchant:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMerchants();
  }, []);

  const filteredMerchants = merchants.filter((m) => {
    const matchQuery =
      m.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.ownerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.slug?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchCategory =
      selectedCategory === "ALL" || m.businessCategory === selectedCategory;

    return matchQuery && matchCategory;
  });

  const categories = [
    "ALL",
    ...Array.from(new Set(merchants.map((m) => m.businessCategory).filter(Boolean))),
  ];

  return (
    <div className="bg-white min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* HEADER DIREKTORI LENDER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200/80">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-blue-700 text-[11px] font-bold uppercase tracking-widest font-mono">
              <Building2 className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>TERMINAL ANALIS KREDIT PERBANKAN • JEJAK VERIFIER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Direktori Paspor Kredit JejaK
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl font-normal">
              Akses terbuka bagi analis bank untuk memeriksa rekam jejak arus kas riil, bukti foto struk/QRIS harian, dan bukti integritas on-chain di BNB Smart Chain.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-700" strokeWidth={1.75} />
              <span>{merchants.length} Toko Terdaftar</span>
            </div>

            <button
              onClick={loadMerchants}
              disabled={loading}
              className="p-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all disabled:opacity-50"
              title="Segarkan Direktori"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-700" : ""}`} strokeWidth={1.75} />
              <span className="hidden sm:inline">Segarkan</span>
            </button>
          </div>
        </div>

        {/* SEARCH & FILTER CONTROLS (BUBBLE) */}
        <div className="bg-slate-50/80 rounded-[24px] border border-slate-200/90 p-4 space-y-3 shadow-2xs">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" strokeWidth={1.75} />
              <input
                type="text"
                placeholder="Cari nama toko, pemilik, kota, atau slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full border border-slate-200 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Filter Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 shrink-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? "bg-slate-950 text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {cat === "ALL" ? "Semua Kategori" : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* LOADING SKELETON */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="p-6 rounded-2xl bg-white border border-slate-200 shadow-antigravity space-y-4 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-200"></div>
                  <div className="space-y-1 flex-1">
                    <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                    <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-16 bg-slate-100 rounded-xl"></div>
                <div className="h-8 bg-slate-200 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : filteredMerchants.length === 0 ? (
          /* EMPTY STATE */
          <div className="p-12 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-300 space-y-3 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 mx-auto shadow-sm">
              <Store className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <h3 className="text-base font-bold text-slate-900">Tidak ada merchant ditemukan</h3>
            <p className="text-xs text-slate-500">
              Coba gunakan kata kunci pencarian yang berbeda atau daftarkan UMKM baru melalui portal kasir.
            </p>
            <div className="pt-2">
              <Link
                href="/merchant/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-950 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
              >
                <span>Daftarkan Usaha Baru</span>
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
              </Link>
            </div>
          </div>
        ) : (
          /* RESPONSIVE 3-COLUMN MERCHANT GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMerchants.map((m) => {
              const totalRevenue =
                m.anchors?.reduce((acc: number, a: any) => acc + (a.totalRevenue || 0), 0) || 0;
              const batchCount = m.anchors?.length || 0;

              return (
                <div
                  key={m.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-antigravity hover:shadow-card-hover transition-all flex flex-col justify-between p-6 group"
                >
                  <div className="space-y-4">
                    {/* Card Header: Store Crest, Category Badge, Status Pill */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                          {m.businessName ? m.businessName.slice(0, 2).toUpperCase() : "UM"}
                        </div>
                        <div className="truncate">
                          <h2 className="text-base font-black text-slate-950 truncate group-hover:text-blue-700 transition-colors">
                            {m.businessName}
                          </h2>
                          <p className="text-xs text-slate-500 truncate">
                            {m.ownerName} • {m.city}
                          </p>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-semibold shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Aktif
                      </span>
                    </div>

                    {/* Category Tag */}
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                        {m.businessCategory || "Kuliner"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ID: {m.slug}
                      </span>
                    </div>

                    {/* Metrics Box */}
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
                      <div>
                        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                          Omzet Terverifikasi
                        </span>
                        <div className="text-sm font-black font-mono text-slate-950 mt-0.5">
                          Rp {totalRevenue.toLocaleString("id-ID")}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                          Batch On-Chain
                        </span>
                        <div className="text-sm font-black font-mono text-blue-700 mt-0.5">
                          {batchCount} Batch
                        </div>
                      </div>
                    </div>

                    {/* Truncated BSC Wallet Address */}
                    <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400">BSC Wallet:</span>
                      <span className="text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                        {m.merchantAddress ? `${m.merchantAddress.slice(0, 6)}...${m.merchantAddress.slice(-4)}` : "-"}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer CTA */}
                  <div className="pt-5 border-t border-slate-100 mt-5">
                    <Link
                      href={`/verify/${m.slug}`}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all group-hover:bg-blue-700 active:scale-95"
                    >
                      <span>Audit Paspor &amp; Verifikasi On-Chain</span>
                      <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
