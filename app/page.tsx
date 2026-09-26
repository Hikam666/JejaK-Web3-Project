"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  Store,
  Building2,
  Lock,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Layers,
  Sparkles,
  Users,
  Gauge,
  ArrowUpRight,
} from "lucide-react";

import { HeroSection } from "@/components/views/HeroSection";

export default function HomePage() {
  const contractAddress =
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
    "0x1Aa385d068C67B163310ac2F487dE51bC02015d4";

  return (
    <div className="bg-white min-h-screen">
      {/* HERO SECTION WITH REAL INDONESIA MAP BACKGROUND */}
      <HeroSection />

      {/* THREE DEMO GATEWAY BUBBLE CARDS */}
      <section className="py-16 bg-slate-50/60 border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-blue-600 font-mono">
              ARSITEKTUR PLATFORM JEJAK
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Tiga Gerbang Akses Terpadu
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm max-w-xl mx-auto">
              Solusi terdesentralisasi tanpa gesekan untuk merchant mikro, analis bank, dan ekosistem Web3.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bubble Card 1: Merchant App */}
            <div className="bg-white rounded-[28px] p-7 border border-slate-200/90 shadow-bubble hover:shadow-card-hover transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
                  <Store className="w-6 h-6" strokeWidth={1.75} />
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold font-mono">
                  MOBILE POS APP
                </div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  1. Kasir JejaK UMKM
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Antarmuka kasir cepat untuk warung kopi dan toko kelontong. Catat transaksi, lampirkan bukti QRIS, dan 1-klik Tutup Buku yang otomatis ter-anchor ke BNB Chain tanpa saldo gas.
                </p>
              </div>

              <div className="pt-6 border-t border-slate-100 mt-6">
                <Link
                  href="/merchant"
                  prefetch={true}
                  className="text-blue-700 hover:text-blue-800 text-xs font-bold flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform"
                >
                  <span>Buka Kasir JejaK</span>
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                </Link>
              </div>
            </div>

            {/* Bubble Card 2: Public Lender Directory */}
            <div className="bg-white rounded-[28px] p-7 border border-slate-200/90 shadow-bubble hover:shadow-card-hover transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
                  <Building2 className="w-6 h-6" strokeWidth={1.75} />
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold font-mono">
                  PUBLIC LENDER PORTAL
                </div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  2. Direktori Verifikasi Bank
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Terminal audit untuk analis kredit perbankan. Periksa profil toko, run-rate omzet 30 hari, rasio konsistensi, serta audit integritas kriptografis Keccak256 secara langsung.
                </p>
              </div>

              <div className="pt-6 border-t border-slate-100 mt-6">
                <Link
                  href="/verify"
                  prefetch={true}
                  className="text-indigo-700 hover:text-indigo-800 text-xs font-bold flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform"
                >
                  <span>Buka Direktori Bank</span>
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                </Link>
              </div>
            </div>

            {/* Bubble Card 3: Digital Soulbound Passport */}
            <div className="bg-white rounded-[28px] p-7 border border-slate-200/90 shadow-bubble hover:shadow-card-hover transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <Sparkles className="w-6 h-6" strokeWidth={1.75} />
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold font-mono">
                  ON-CHAIN REPUTATION
                </div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  3. Paspor Digital &amp; SBT
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Paspor kredit bisnis on-chain berbasis standar EIP-5192 (Soulbound Token). Terkunci permanen pada dompet UMKM dan membuktikan integritas omzet toko tanpa risiko pemalsuan.
                </p>
              </div>

              <div className="pt-6 border-t border-slate-100 mt-6">
                <Link
                  href="/verify"
                  prefetch={true}
                  className="text-amber-700 hover:text-amber-800 text-xs font-bold flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform"
                >
                  <span>Lihat Demo Paspor</span>
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM VS SOLUTION COMPARISON (TWO BUBBLE CARDS) */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-blue-600 font-mono">
              STANDAR REPUTASI DIGITAL
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Pembukuan Konvensional vs JejaK
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm max-w-lg mx-auto">
              Menghilangkan resiko manipulasi data nota fiktif sebelum pengajuan pinjaman bank.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bubble Card 1: Konvensional */}
            <div className="bg-slate-50/80 rounded-[28px] p-8 border border-slate-200/90 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="text-base font-bold text-slate-800">
                  Sistem Manual / Konvensional
                </h3>
                <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                  Resiko Tinggi
                </span>
              </div>

              <ul className="space-y-4 text-xs text-slate-600">
                <li className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                    ✕
                  </div>
                  <div>
                    <strong className="text-slate-800">Rentan Manipulasi:</strong> Nota dan buku kas mudah ditulis ulang secara fiktif menjelang survey analis bank.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                    ✕
                  </div>
                  <div>
                    <strong className="text-slate-800">Biaya Survey Mahal:</strong> Bank harus mengirim petugas ke lapangan, membebankan biaya audit hingga jutaan rupiah per nasabah.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                    ✕
                  </div>
                  <div>
                    <strong className="text-slate-800">Tidak Portabel:</strong> Rekam jejak di satu lembaga keuangan tidak dapat diakui oleh bank lain.
                  </div>
                </li>
              </ul>
            </div>

            {/* Bubble Card 2: JejaK */}
            <div className="bg-white rounded-[28px] p-8 border border-blue-200/90 shadow-bubble space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-950 flex items-center gap-1.5">
                  <span>JejaK (KreditPass)</span>
                </h3>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  Terverifikasi BNB Chain
                </span>
              </div>

              <ul className="space-y-4 text-xs text-slate-600">
                <li className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-700" strokeWidth={2} />
                  </div>
                  <div>
                    <strong className="text-slate-900">Kriptografi Keccak256:</strong> Setiap batch penjualan harian di-hash dan dikunci permanen ke smart contract BSC.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-700" strokeWidth={2} />
                  </div>
                  <div>
                    <strong className="text-slate-900">ERC-5192 Soulbound Token:</strong> Paspor reputasi terikat permanen pada dompet toko, tidak dapat dipindahtangankan atau dijual.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-700" strokeWidth={2} />
                  </div>
                  <div>
                    <strong className="text-slate-900">Verifikasi 1-Detik:</strong> Analis perbankan cukup membuka URL paspor untuk memvalidasi arus kas riil secara matematis.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SMART CONTRACT AUDIT CALLOUT BUBBLE */}
      <section className="py-10 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="p-5 rounded-[24px] bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                <Lock className="w-5 h-5 text-slate-200" strokeWidth={1.75} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Smart Contract JejaK (BSC Testnet)
                </h4>
                <p className="text-[11px] text-slate-500 font-mono break-all">
                  {contractAddress}
                </p>
              </div>
            </div>
            <a
              href={`https://testnet.bscscan.com/address/${contractAddress}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition-colors shrink-0"
            >
              <span>Lihat di BscScan</span>
              <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.75} />
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER BAR */}
      <footer className="py-6 border-t border-slate-200/80 bg-white text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>&copy; {new Date().getFullYear()} JejaK Protocol. Powered by BNB Smart Chain.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/verify" className="hover:text-slate-800 transition-colors">
              Direktori Bank
            </Link>
            <Link href="/merchant/login" className="hover:text-slate-800 transition-colors">
              Portal Kasir
            </Link>
            <Link
              href="/admin/login"
              className="text-slate-400 hover:text-slate-600 transition-colors font-mono text-[10px]"
            >
              Operator
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
