"use client";

import Image from "next/image";
import Link from "next/link";
import { Store, ChevronRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-slate-200/80">
      {/* Real Indonesia Map Vector SVG Background - Full Bleed 100% Background */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
        <Image
          src="/indonesia-map.svg"
          alt="Peta Indonesia JejaK"
          fill
          className="object-cover opacity-[0.15] scale-105"
          priority
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
        {/* Top Logo Emblem Badge */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 items-center justify-center flex">
            <Image
              src="/logo.svg"
              alt="JejaK Crest"
              width={64}
              height={64}
              className="w-full h-full object-contain"
              priority
            />
          </div>

          {/* Status Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>LIVE ON BSC TESTNET</span>
          </div>
        </div>

        {/* Category Subtitle */}
        <div className="text-[11px] font-extrabold uppercase tracking-widest text-blue-600 font-mono">
          JEJAK &mdash; DARI TRANSAKSI JADI KEPERCAYAAN
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-950 max-w-4xl mx-auto leading-[1.12]">
          Ubah Struk Kasir Menjadi{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700">
            Tiket Pinjaman Bank
          </span>{" "}
          Tanpa Agunan Fisik.
        </h1>

        {/* Sub-headline */}
        <p className="text-slate-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
          Portofolio reputasi bisnis milik UMKM, dibangun dari jejak transaksi kasir harian yang dikunci berkala ke BNB Smart Chain secara otomatis tanpa biaya gas dan tanpa MetaMask.
        </p>

        {/* Dual Action Bubble Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/merchant/login"
            prefetch={true}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            <Store className="w-4 h-4 text-slate-300" strokeWidth={1.75} />
            <span>Masuk ke Kasir</span>
            <ChevronRight className="w-4 h-4 text-slate-400" strokeWidth={1.75} />
          </Link>

          <Link
            href="/merchant/login"
            prefetch={true}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 shadow-sm transition-all active:scale-95"
          >
            <span>Daftar UMKM Baru</span>
          </Link>
        </div>

        {/* 3 Key Metrics at Base */}
        <div className="pt-8 sm:pt-10 grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto border-t border-slate-200/80">
          <div className="text-center space-y-1">
            <div className="text-xl sm:text-3xl font-black text-slate-950 font-mono">
              100%
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500">
              On-Chain
            </div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-xl sm:text-3xl font-black text-blue-600 font-mono">
              &lt;5s
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Finalitas
            </div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-xl sm:text-3xl font-black text-slate-950 font-mono">
              Rp 0
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Gas Fee Kasir
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
