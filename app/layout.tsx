import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { Landmark, ArrowUpRight, ShieldCheck, Gauge, Store } from "lucide-react";

export const metadata: Metadata = {
  title: "JejaK | Paspor Reputasi Kredit UMKM di BNB Smart Chain",
  description: "Ubah struk kasir harian menjadi tiket pinjaman bank tanpa agunan fisik melalui penguncian data kriptografis di BNB Chain.",
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const contractAddress =
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
    "0x1Aa385d068C67B163310ac2F487dE51bC02015d4";

  return (
    <html lang="id" className="h-full bg-white">
      <head>
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <link rel="shortcut icon" href="/logo.svg" />
        <link rel="apple-touch-icon" href="/logo.svg" />
      </head>
      <body className="min-h-full flex flex-col bg-white text-slate-900 selection:bg-blue-50 selection:text-blue-900">
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Brand Logo & Identifier */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 shrink-0 flex items-center justify-center transition-transform group-hover:scale-105">
                <Image
                  src="/logo.svg"
                  alt="JejaK Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black tracking-tight text-slate-950 font-sans">
                    JejaK
                  </span>
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.2 rounded-full border border-blue-200/60">
                    KreditPass
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium -mt-0.5">
                  BNB Smart Chain
                </span>
              </div>
            </Link>

            {/* Navigation & Controls */}
            <nav className="flex items-center gap-2 sm:gap-4">
              <div className="hidden md:flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-600">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Live on BSC Testnet</span>
              </div>

              <Link
                href="/verify"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <Landmark className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.75} />
                <span>Direktori Bank</span>
              </Link>

              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <Gauge className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.75} />
                <span>Gas Monitor</span>
              </Link>

              <Link
                href="/merchant/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-slate-950 text-white hover:bg-slate-800 shadow-sm transition-all active:scale-95"
              >
                <Store className="w-3.5 h-3.5 text-slate-300" strokeWidth={1.75} />
                <span>Akses Kasir</span>
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">JejaK</span>
              <span>•</span>
              <p>Jejak Reputasi Kredit UMKM Terkunci di BNB Chain.</p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href={`https://testnet.bscscan.com/address/${contractAddress}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-mono text-blue-700 hover:text-blue-800 hover:underline"
              >
                <span>Kontrak BSC: {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}</span>
                <ArrowUpRight className="w-3 h-3" strokeWidth={1.75} />
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
