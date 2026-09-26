"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Store,
  QrCode,
  Banknote,
  Upload,
  Lock,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  RefreshCw,
  Award,
  Camera,
  LogOut,
  X,
  Plus,
  Minus,
  Trash2,
  Utensils,
  Coffee,
  ShoppingBag,
  Share2,
  Copy,
  Building2,
  ChevronRight,
  Sparkles,
  Layers,
  FileCheck2,
  Check,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Key,
  Eye,
  EyeOff,
  AlertTriangle,
  Download,
} from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface CartItem {
  id: string;
  menuId: string;
  name: string;
  price: number;
  qty: number;
}

const DEFAULT_MENUS: MenuItem[] = [
  { id: "m1", name: "Es Kopi Susu", price: 18000, category: "Minuman" },
  { id: "m2", name: "Nasi Goreng Spesial", price: 25000, category: "Makanan" },
  { id: "m3", name: "Es Teh Manis", price: 5000, category: "Minuman" },
  { id: "m4", name: "Roti Bakar Keju", price: 15000, category: "Camilan" },
  { id: "m5", name: "Pisang Goreng Madu", price: 12000, category: "Camilan" },
  { id: "m6", name: "Paket Makan Siang", price: 30000, category: "Paket" },
];

export default function MerchantAppSPA() {
  const router = useRouter();
  const [currentMerchant, setCurrentMerchant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // SPA TABS: Kasir Cepat, Tutup Buku, Paspor Bisnis
  const [activeTab, setActiveTab] = useState<"cashier" | "closebook" | "passport">("cashier");

  // State Quick Menu Presets
  const [menuItems, setMenuItems] = useState<MenuItem[]>(DEFAULT_MENUS);
  const [isManagingMenu, setIsManagingMenu] = useState(false);
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [newMenuForm, setNewMenuForm] = useState({ name: "", price: "", category: "Makanan" });

  // State Keranjang Pembelian (Order Cart)
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isBasketOpen, setIsBasketOpen] = useState(true);

  // State Manual Fallback (Jika transaksi langsung tanpa item menu)
  const [manualAmount, setManualAmount] = useState<string>("0");
  const [manualNote, setManualNote] = useState<string>("");

  // Payment & Proof
  const [paymentMethod, setPaymentMethod] = useState<"QRIS" | "CASH" | "TRANSFER">("QRIS");
  const [proofImageBase64, setProofImageBase64] = useState<string | null>(null);
  const [savingTx, setSavingTx] = useState<boolean>(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // State Tutup Buku
  const [pendingTxs, setPendingTxs] = useState<any[]>([]);
  const [pendingSummary, setPendingSummary] = useState({ totalAmount: 0, count: 0 });
  const [anchoring, setAnchoring] = useState<boolean>(false);
  const [anchorStep, setAnchorStep] = useState<string>("");
  const [lastAnchorResult, setLastAnchorResult] = useState<any>(null);

  // State Paspor
  const [merchantPassportData, setMerchantPassportData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // State Ekspor Dompet & Uji TC-19 Soulbound
  const [showExportWalletModal, setShowExportWalletModal] = useState(false);
  const [exportPinInput, setExportPinInput] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState("");
  const [decryptedWallet, setDecryptedWallet] = useState<{ merchantAddress: string; privateKey: string } | null>(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [testingSoulbound, setTestingSoulbound] = useState(false);
  const [soulboundTestResult, setSoulboundTestResult] = useState<any>(null);

  // State Modal Inspeksi Visual NFT SBT & Batch Receipt
  const [showSbtVisualModal, setShowSbtVisualModal] = useState(false);
  const [selectedBatchNftIndex, setSelectedBatchNftIndex] = useState<number | null>(null);

  const handleDownloadSbt = async () => {
    if (!currentMerchant?.slug) return;
    try {
      const res = await fetch(`/api/nft/merchant/${currentMerchant.slug}/sbt`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `JejaK-Master-SBT-${currentMerchant.slug}.svg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error("Gagal mengunduh kartu SBT:", e);
    }
  };

  const handleDownloadBatch = async (batchIdx: number) => {
    if (!currentMerchant?.slug) return;
    try {
      const res = await fetch(`/api/nft/merchant/${currentMerchant.slug}/batch/${batchIdx}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `JejaK-Batch-Receipt-${currentMerchant.slug}-BATCH-${String(batchIdx).padStart(3, "0")}.svg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error("Gagal mengunduh struk batch:", e);
    }
  };

  // Cek Sesi Login UMKM & Validasi ke Database
  useEffect(() => {
    const saved = localStorage.getItem("merchant_session");
    if (!saved) {
      router.push("/merchant/login");
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      if (!parsed || !parsed.id) {
        localStorage.removeItem("merchant_session");
        router.push("/merchant/login");
        return;
      }

      fetch(`/api/merchants?id=${parsed.id}`)
        .then((res) => res.json())
        .then((json) => {
          if (!json.success || !json.data) {
            localStorage.removeItem("merchant_session");
            router.push("/merchant/login");
            return;
          }

          setCurrentMerchant(json.data);

          const savedMenus = localStorage.getItem(`merchant_menus_${parsed.id}`);
          if (savedMenus) {
            try {
              setMenuItems(JSON.parse(savedMenus));
            } catch {}
          }

          loadPendingTransactions(parsed.id);
          loadPassportData(parsed.id);
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem("merchant_session");
          router.push("/merchant/login");
        });
    } catch {
      localStorage.removeItem("merchant_session");
      router.push("/merchant/login");
    }
  }, [router]);

  async function loadPendingTransactions(merchantId: string) {
    try {
      const res = await fetch(`/api/transactions?merchantId=${merchantId}&status=PENDING_ANCHOR`);
      const json = await res.json();
      if (json.success) {
        setPendingTxs(json.data || []);
        setPendingSummary(json.pending || { totalAmount: 0, count: 0 });
      }
    } catch (err) {
      console.error("Error loading pending transactions:", err);
    }
  }

  async function loadPassportData(merchantId: string) {
    try {
      const res = await fetch(`/api/merchants?id=${merchantId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setMerchantPassportData(json.data);
      }
    } catch (err) {
      console.error("Error loading passport data:", err);
    }
  }

  const handleLogout = () => {
    if (confirm("Apakah Anda yakin ingin keluar dari sesi kasir?")) {
      localStorage.removeItem("merchant_session");
      router.push("/merchant/login");
    }
  };

  const handleAddToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuId === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menuId === item.id ? { ...c, qty: c.qty + 1 } : c
        );
      } else {
        return [
          ...prev,
          {
            id: "cart_" + item.id + "_" + Date.now(),
            menuId: item.id,
            name: item.name,
            price: item.price,
            qty: 1,
          },
        ];
      }
    });
  };

  const handleUpdateCartQty = (menuId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.menuId === menuId) {
            const newQty = c.qty + delta;
            return newQty > 0 ? { ...c, qty: newQty } : null;
          }
          return c;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleClearCart = () => {
    setCart([]);
    setManualAmount("0");
    setManualNote("");
  };

  const handleAddCustomMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuForm.name || !newMenuForm.price) return;

    const newItem: MenuItem = {
      id: "custom_" + Date.now(),
      name: newMenuForm.name,
      price: parseInt(newMenuForm.price, 10),
      category: newMenuForm.category || "Makanan",
    };

    const updated = [...menuItems, newItem];
    setMenuItems(updated);
    if (currentMerchant) {
      localStorage.setItem(`merchant_menus_${currentMerchant.id}`, JSON.stringify(updated));
    }
    setNewMenuForm({ name: "", price: "", category: "Makanan" });
    setShowAddMenuModal(false);
  };

  const handleDeleteMenuItem = (menuId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Hapus menu ini dari katalog toko?")) {
      const updated = menuItems.filter((m) => m.id !== menuId);
      setMenuItems(updated);
      if (currentMerchant) {
        localStorage.setItem(`merchant_menus_${currentMerchant.id}`, JSON.stringify(updated));
      }
    }
  };

  const totalCartAmount = cart.reduce((acc, c) => acc + c.price * c.qty, 0);
  const totalCartQty = cart.reduce((acc, c) => acc + c.qty, 0);

  const currentTotalAmount = cart.length > 0 ? totalCartAmount : parseFloat(manualAmount || "0");
  const currentNote =
    cart.length > 0
      ? cart.map((c) => `${c.name} (${c.qty}x)`).join(", ")
      : manualNote || (paymentMethod === "QRIS" ? "Pembayaran QRIS" : "Pembayaran Tunai");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setProofImageBase64(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const addManualAmount = (val: number) => {
    const current = parseInt(manualAmount || "0", 10);
    setManualAmount((current + val).toString());
  };

  const handleSaveTransaction = async () => {
    if (!currentMerchant || currentTotalAmount <= 0) return;

    const tempId = "temp_" + Date.now();
    const optimisticTx = {
      id: tempId,
      merchantId: currentMerchant.id,
      amount: currentTotalAmount,
      paymentMethod,
      note: currentNote,
      proofImageUrl: proofImageBase64,
      status: "PENDING_ANCHOR",
      createdAt: new Date().toISOString(),
    };

    setPendingTxs((prev) => [optimisticTx, ...prev]);
    setPendingSummary((prev) => ({
      totalAmount: prev.totalAmount + currentTotalAmount,
      count: prev.count + 1,
    }));
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 2500);

    handleClearCart();
    removePhoto();

    try {
      setSavingTx(true);
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId: currentMerchant.id,
          amount: currentTotalAmount,
          paymentMethod,
          note: currentNote,
          proofImageUrl: proofImageBase64,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setPendingTxs((prev) =>
          prev.map((t) => (t.id === tempId ? json.data : t))
        );
      }
    } catch (err: any) {
      console.error("Failed to sync transaction:", err);
    } finally {
      setSavingTx(false);
    }
  };

  const handleCloseBookAndAnchor = async () => {
    if (!currentMerchant || pendingSummary.count === 0) return;
    try {
      setAnchoring(true);
      setLastAnchorResult(null);

      setAnchorStep("1. Menghitung Hash Keccak256 ringkasan omzet...");
      await new Promise((r) => setTimeout(r, 600));

      setAnchorStep("2. Relayer Mengirim Transaksi ke BSC (Gasless)...");
      await new Promise((r) => setTimeout(r, 600));

      setAnchorStep("3. Menerbitkan Kredensial Batch NFT ke Smart Contract...");

      const res = await fetch("/api/anchor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantId: currentMerchant.id }),
      });
      const json = await res.json();

      if (json.success) {
        setLastAnchorResult(json.data);
        await loadPendingTransactions(currentMerchant.id);
        await loadPassportData(currentMerchant.id);
      } else {
        alert("Gagal mengunci transaksi: " + json.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setAnchoring(false);
      setAnchorStep("");
    }
  };

  const slug = currentMerchant?.slug || "";
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/verify/${slug}`
      : `/verify/${slug}`;

  const handleCopyPassport = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMerchant || !exportPinInput) return;
    setExportLoading(true);
    setExportError("");
    try {
      const res = await fetch("/api/auth/merchant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "export-wallet",
          merchantId: currentMerchant.id,
          pin: exportPinInput,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setDecryptedWallet(json.data);
      } else {
        setExportError(json.error || "PIN salah. Akses ditolak.");
      }
    } catch (err: any) {
      setExportError(err.message || "Gagal menghubungi server");
    } finally {
      setExportLoading(false);
    }
  };

  const handleTestSoulboundTransfer = async () => {
    if (!currentMerchant || !exportPinInput) return;
    setTestingSoulbound(true);
    setSoulboundTestResult(null);
    try {
      const res = await fetch("/api/nft/test-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId: currentMerchant.id,
          pin: exportPinInput,
          tokenId: merchantPassportData?.sbt?.tokenId || "1",
        }),
      });
      const json = await res.json();
      setSoulboundTestResult(json);
    } catch (err: any) {
      setSoulboundTestResult({ success: false, error: err.message });
    } finally {
      setTestingSoulbound(false);
    }
  };

  const handleCopyKey = () => {
    if (!decryptedWallet) return;
    navigator.clipboard.writeText(decryptedWallet.privateKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyAddress = () => {
    if (!decryptedWallet && !currentMerchant) return;
    const addr = decryptedWallet?.merchantAddress || currentMerchant?.merchantAddress;
    navigator.clipboard.writeText(addr);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center space-y-3 bg-white">
        <RefreshCw className="w-8 h-8 text-blue-700 animate-spin" strokeWidth={1.75} />
        <p className="text-xs font-semibold text-slate-500">Memeriksa kredensial kasir toko...</p>
      </div>
    );
  }

  const totalAnchoredRevenue =
    merchantPassportData?.anchors?.reduce(
      (acc: number, a: any) => acc + a.totalRevenue,
      0
    ) || 0;

  return (
    <div className="min-h-screen bg-slate-100/60 flex flex-col justify-between">
      {/* VIEWPORT CONTAINER CONSTRAINT: max-w-[480px] on desktop, 100% full width on mobile */}
      <div className="w-full max-w-[480px] mx-auto bg-white min-h-screen flex flex-col sm:my-4 sm:rounded-[36px] sm:border sm:border-slate-200/90 sm:shadow-bubble overflow-hidden pb-20">
        
        {/* FIXED TOP HEADER */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 flex items-center justify-center">
              <Image
                src="/logo.svg"
                alt="JejaK Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-black text-slate-950 truncate max-w-[160px]">
                  {currentMerchant?.businessName}
                </h1>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono mt-0.5">
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                  {currentMerchant?.city || "Jakarta"}
                </span>
                <span>•</span>
                <span>{currentMerchant?.merchantAddress?.slice(0, 6)}...{currentMerchant?.merchantAddress?.slice(-4)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setShowExportWalletModal(true);
                setDecryptedWallet(null);
                setExportPinInput("");
                setExportError("");
                setSoulboundTestResult(null);
              }}
              className="p-2 rounded-full text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
              title="Ekspor Dompet Web3 / Private Key"
            >
              <Key className="w-4 h-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-full text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition-colors"
              title="Keluar dari Kasir"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>
        </header>

        {/* OPTIMISTIC SUCCESS TOAST */}
        {saveSuccessNotice && (
          <div className="bg-emerald-600 text-white text-xs font-bold py-2 px-4 flex items-center justify-center gap-2 shadow-sm animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
            <span>Transaksi Kasir Berhasil Dicatat</span>
          </div>
        )}

        {/* TAB 1: KASIR CEPAT (POS INTERFACE) */}
        {activeTab === "cashier" && (
          <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              
              {/* CATALOG HEADER & ACTION */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Katalog Menu Cepat
                  </h2>
                  <p className="text-[11px] text-slate-500">Pilih item untuk memasukkan ke struk</p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsManagingMenu(!isManagingMenu)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                      isManagingMenu
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                    }`}
                  >
                    {isManagingMenu ? "Selesai" : "Kelola"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddMenuModal(true)}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/70 hover:bg-blue-100 flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" strokeWidth={2} /> Tambah
                  </button>
                </div>
              </div>

              {/* 2-COLUMN MENU GRID (Ref Image 1 inspired) */}
              <div className="grid grid-cols-2 gap-2.5">
                {menuItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => !isManagingMenu && handleAddToCart(item)}
                    className={`relative p-3 rounded-2xl border text-left transition-all ${
                      isManagingMenu
                        ? "border-rose-200 bg-rose-50/40 cursor-default"
                        : "border-slate-200 bg-white hover:border-blue-600/40 hover:bg-blue-50/20 active:scale-[0.98] cursor-pointer shadow-sm"
                    }`}
                  >
                    {isManagingMenu && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteMenuItem(item.id, e)}
                        className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs shadow-md z-10"
                        title="Hapus Menu"
                      >
                        <Trash2 className="w-3 h-3" strokeWidth={2} />
                      </button>
                    )}

                    <div className="flex items-start justify-between">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-2">
                        {item.category === "Minuman" ? (
                          <Coffee className="w-4 h-4 text-blue-700" strokeWidth={1.75} />
                        ) : (
                          <Utensils className="w-4 h-4 text-slate-700" strokeWidth={1.75} />
                        )}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full">
                        {item.category}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-900 truncate">
                      {item.name}
                    </div>
                    <div className="text-xs font-mono font-black text-blue-700 mt-1">
                      Rp {item.price.toLocaleString("id-ID")}
                    </div>
                  </div>
                ))}
              </div>

              {/* ORDER BASKET PANEL (Collapsible Drawer with +/- buttons) */}
              {cart.length > 0 && (
                <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <button
                      type="button"
                      onClick={() => setIsBasketOpen(!isBasketOpen)}
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-800"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-blue-700" strokeWidth={1.75} />
                      <span>Keranjang ({totalCartQty} Item)</span>
                      {isBasketOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                    </button>
                    <button
                      type="button"
                      onClick={handleClearCart}
                      className="text-[10px] font-bold text-rose-600 hover:underline"
                    >
                      Kosongkan
                    </button>
                  </div>

                  {isBasketOpen && (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {cart.map((c) => (
                        <div
                          key={c.menuId}
                          className="p-2 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                        >
                          <div className="truncate mr-2">
                            <p className="font-bold text-slate-800 truncate">{c.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              Rp {c.price.toLocaleString("id-ID")}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-0.5 border border-slate-200 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleUpdateCartQty(c.menuId, -1)}
                              className="w-5 h-5 rounded bg-white text-slate-800 font-bold flex items-center justify-center hover:bg-slate-200"
                            >
                              <Minus className="w-3 h-3" strokeWidth={2} />
                            </button>
                            <span className="w-5 text-center font-mono font-bold text-xs text-slate-900">
                              {c.qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateCartQty(c.menuId, 1)}
                              className="w-5 h-5 rounded bg-white text-slate-800 font-bold flex items-center justify-center hover:bg-slate-200"
                            >
                              <Plus className="w-3 h-3" strokeWidth={2} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* FALLBACK MANUAL INPUT & PRESET CHIPS */}
              {cart.length === 0 && (
                <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Input Nominal Manual</span>
                    <button
                      type="button"
                      onClick={() => setManualAmount("0")}
                      className="text-[10px] text-slate-400 hover:text-slate-700"
                    >
                      Reset
                    </button>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 font-bold text-xs text-slate-400 font-mono">
                      Rp
                    </span>
                    <input
                      type="number"
                      value={manualAmount}
                      onChange={(e) => setManualAmount(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 font-mono text-sm font-bold text-slate-950 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => addManualAmount(10000)}
                      className="flex-1 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-mono font-bold text-slate-700 hover:bg-slate-100"
                    >
                      +10.000
                    </button>
                    <button
                      type="button"
                      onClick={() => addManualAmount(25000)}
                      className="flex-1 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-mono font-bold text-slate-700 hover:bg-slate-100"
                    >
                      +25.000
                    </button>
                    <button
                      type="button"
                      onClick={() => addManualAmount(50000)}
                      className="flex-1 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-mono font-bold text-slate-700 hover:bg-slate-100"
                    >
                      +50.000
                    </button>
                  </div>
                </div>
              )}

              {/* PAYMENT METHOD TOGGLE: QRIS VS TUNAI */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 block">Metode Pembayaran</span>
                <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("QRIS")}
                    className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === "QRIS"
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" strokeWidth={1.75} />
                    <span>QRIS Digital</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("CASH")}
                    className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === "CASH"
                        ? "bg-white text-emerald-700 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <Banknote className="w-3.5 h-3.5" strokeWidth={1.75} />
                    <span>Tunai (Cash)</span>
                  </button>
                </div>
              </div>

              {/* CAMERA TRIGGER & PROOF PREVIEW */}
              <div className="space-y-1.5">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />

                {!proofImageBase64 ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-300 hover:border-blue-600 bg-slate-50 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-2 text-xs font-semibold text-slate-700"
                  >
                    <Camera className="w-4 h-4 text-blue-700" strokeWidth={1.75} />
                    <span>Ambil Foto Struk / Screenshot QRIS</span>
                  </button>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm h-20 bg-slate-950">
                    <img
                      src={proofImageBase64}
                      alt="Struk Kasir"
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-2 text-white text-[10px]">
                      <span className="flex items-center gap-1 font-bold text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" strokeWidth={2} />
                        Foto Terlampir
                      </span>
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* TOTAL BILL DISPLAY CARD */}
              <div className="p-4 rounded-2xl bg-slate-950 text-white shadow-antigravity space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  <span>Total Tagihan Pelanggan</span>
                  <span>{cart.length > 0 ? `${totalCartQty} Item` : "Manual"}</span>
                </div>
                <div className="text-2xl font-black font-mono tracking-tight text-white">
                  Rp {currentTotalAmount.toLocaleString("id-ID")}
                </div>
              </div>
            </div>

            {/* MAIN ACTION BUTTON */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveTransaction}
                disabled={savingTx || currentTotalAmount <= 0}
                className="w-full py-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {savingTx ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={1.75} />
                    <span>Mencatat Penjualan...</span>
                  </>
                ) : (
                  <>
                    <span>Simpan &amp; Cetak Nota</span>
                    <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: TUTUP BUKU (DAILY SETTLEMENT ANCHORING) */}
        {activeTab === "closebook" && (
          <div className="p-4 flex-1 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              
              {/* PENDING BUFFER CARD */}
              <div className="bg-slate-950 text-white p-5 rounded-2xl shadow-antigravity space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Omzet Belum Terkunci
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 text-[10px] font-bold font-mono">
                    {pendingSummary.count} Transaksi
                  </span>
                </div>

                <div className="text-3xl font-black font-mono tracking-tight text-white">
                  Rp {pendingSummary.totalAmount.toLocaleString("id-ID")}
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-2 border-t border-slate-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" strokeWidth={1.75} />
                  <span>Biaya gas BNB Chain disubsidi penuh oleh relayer platform.</span>
                </div>
              </div>

              {/* TRANSACTION LEDGER LIST */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Antrean Transaksi Hari Ini</span>
                  <span className="text-slate-400 font-normal">{pendingTxs.length} Nota</span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {pendingTxs.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs space-y-1">
                      <p className="font-semibold text-slate-600">Semua transaksi telah terselesaikan on-chain.</p>
                      <p>Catat transaksi baru di tab Kasir untuk menambah omzet.</p>
                    </div>
                  ) : (
                    pendingTxs.map((tx) => (
                      <div
                        key={tx.id}
                        className="p-3 bg-white rounded-xl border border-slate-200/90 flex items-center justify-between text-xs shadow-2xs"
                      >
                        <div className="truncate mr-2">
                          <div className="font-bold text-slate-800 truncate">
                            {tx.note || "Penjualan Kasir"}
                          </div>
                          <div className="text-slate-500 text-[10px] flex items-center gap-1.5 mt-0.5 font-mono">
                            <span className="px-1.5 py-0.2 rounded bg-slate-100 font-semibold text-slate-700">
                              {tx.paymentMethod}
                            </span>
                            <span>{new Date(tx.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
                            {tx.proofImageUrl && (
                              <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                                • Foto Ada
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="font-mono font-bold text-slate-900 shrink-0">
                          Rp {tx.amount.toLocaleString("id-ID")}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* SUCCESS CONFIRMATION CARD */}
              {lastAnchorResult && (
                <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                    <span>Batch Berhasil Dikunci ke BNB Chain</span>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-emerald-200/80 space-y-1 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Batch Settlement NFT:</span>
                      <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                        Token #{lastAnchorResult.batchTokenId || "Baru"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Status Paspor (SBT):</span>
                      <span className="font-bold text-slate-900">
                        Skor Kredit Telah Diperbarui
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <a
                      href={lastAnchorResult.bscScanUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline"
                    >
                      <span>Lihat di BscScan</span>
                      <ExternalLink className="w-3 h-3" strokeWidth={1.75} />
                    </a>
                    <button
                      type="button"
                      onClick={() => setActiveTab("passport")}
                      className="text-[11px] font-bold text-blue-700 hover:underline"
                    >
                      Buka Paspor Toko &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* MASTER ANCHOR ACTION BUTTON */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleCloseBookAndAnchor}
                disabled={anchoring || pendingSummary.count === 0}
                className="w-full py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-sm active:scale-95 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
              >
                {anchoring ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={1.75} />
                    <span>{anchorStep || "Memproses Tutup Buku..."}</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" strokeWidth={1.75} />
                    <span>Tutup Buku &amp; Kunci ke Blockchain (Gasless)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: PASPOR TOKO (BUSINESS CREDENTIAL VIEW) */}
        {activeTab === "passport" && (
          <div className="p-4 flex-1 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              
              {/* MASTER SOULBOUND TOKEN (ERC-5192) CARD */}
              <div className="rounded-2xl bg-slate-950 text-white p-5 shadow-antigravity border border-slate-800 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-800/40">
                      BNB Chain Soulbound Passport
                    </span>
                    <h2 className="text-base font-black text-white pt-1">
                      {currentMerchant?.businessName}
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      {currentMerchant?.ownerName} • {currentMerchant?.city}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-semibold block">Skor Kredit</span>
                    <span className="text-xl font-black text-emerald-400 font-mono">
                      {merchantPassportData?.sbt?.creditScore || 85}/100
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Akreditasi Tier</span>
                    <span className="font-bold text-amber-400 font-sans">
                      {merchantPassportData?.sbt?.tierName || "Silver Credential"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Status Token</span>
                    <span className="font-mono text-[11px] text-slate-300">
                      ERC-5192 (Non-Transferable)
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
                  <div className="text-[10px] font-mono text-slate-400 break-all flex items-center justify-between gap-2">
                    <span className="truncate">Wallet: {currentMerchant?.merchantAddress}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowExportWalletModal(true);
                        setDecryptedWallet(null);
                        setExportPinInput("");
                        setExportError("");
                        setSoulboundTestResult(null);
                      }}
                      className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold flex items-center gap-1 border border-amber-500/30 transition-all cursor-pointer"
                    >
                      <Key className="w-3 h-3 text-amber-400" />
                      <span>Ekspor Dompet</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowSbtVisualModal(true)}
                      className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-[0.98]"
                    >
                      <Sparkles className="w-4 h-4 text-slate-950" />
                      <span>Lihat Visual SBT</span>
                    </button>
                    <Link
                      href="/merchant/passport"
                      className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <span>Lembar Paspor HD</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* 4 UNDERWRITING WIDGET CARDS (Ref Image 2 inspired) */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Widget 1: Omzet 30 Hari */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">
                    Omzet 30 Hari
                  </span>
                  <div className="text-sm font-black font-mono text-slate-950">
                    Rp {(merchantPassportData?.creditMetrics?.monthlyRunRate || totalAnchoredRevenue).toLocaleString("id-ID")}
                  </div>
                  <span className="text-[10px] text-slate-500 block">Run-rate aktif</span>
                </div>

                {/* Widget 2: Rekomendasi Plafon */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">
                    Plafon Bank
                  </span>
                  <div className="text-sm font-black font-mono text-blue-700">
                    Rp {(merchantPassportData?.creditMetrics?.recommendedLoanPlafond || Math.round(totalAnchoredRevenue * 0.5)).toLocaleString("id-ID")}
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold block">50% omzet bulanan</span>
                </div>

                {/* Widget 3: Rasio Konsistensi */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">
                    Konsistensi
                  </span>
                  <div className="text-sm font-black font-mono text-slate-950">
                    {merchantPassportData?.creditMetrics?.consistencyScore || 78}%
                  </div>
                  <span className="text-[10px] text-slate-500 block">Aktivitas mingguan</span>
                </div>

                {/* Widget 4: Total Terkunci BSC */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">
                    Total di BSC
                  </span>
                  <div className="text-sm font-black font-mono text-slate-950">
                    Rp {totalAnchoredRevenue.toLocaleString("id-ID")}
                  </div>
                  <span className="text-[10px] text-slate-500 block">Volume terverifikasi</span>
                </div>
              </div>

              {/* SETTLEMENT BATCH HISTORY */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Riwayat Batch Settlement
                  </h3>
                  <span className="text-[10px] font-bold font-mono text-slate-500">
                    {merchantPassportData?.anchors?.length || 0} Batch
                  </span>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 text-xs">
                  {merchantPassportData?.anchors && merchantPassportData.anchors.length > 0 ? (
                    merchantPassportData.anchors.map((b: any, idx: number) => (
                      <div
                        key={b.id || idx}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-slate-800">
                            Batch #{idx + 1}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {new Date(b.periodDate || b.createdAt).toLocaleDateString("id-ID")}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="font-mono font-bold text-slate-900">
                            Rp {b.totalRevenue.toLocaleString("id-ID")}
                          </p>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedBatchNftIndex(idx + 1)}
                              className="px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold inline-flex items-center gap-1 transition-all"
                            >
                              <Eye className="w-2.5 h-2.5 text-amber-600" />
                              <span>Struk NFT</span>
                            </button>
                            <a
                              href={b.bscTxHash || b.txHash ? `https://testnet.bscscan.com/tx/${b.bscTxHash || b.txHash}` : "#"}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-blue-700 hover:underline inline-flex items-center gap-0.5 font-medium"
                            >
                              <span>BscScan</span>
                              <ExternalLink className="w-2.5 h-2.5" strokeWidth={1.75} />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic text-center py-2">
                      Belum ada riwayat batch settlement. Lakukan Tutup Buku untuk mengunci transaksi perdana.
                    </p>
                  )}
                </div>
              </div>

              {/* SHARE ACTION CARD */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-center space-y-2.5">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    Tautan Paspor untuk Analis Bank
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Kirim link ini saat mengajukan pinjaman modal usaha
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-700 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleCopyPassport}
                    className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold shrink-0 flex items-center gap-1"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2} />
                        <span>Disalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" strokeWidth={1.75} />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="pt-1">
                  <Link
                    href={`/verify/${slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline"
                  >
                    <Building2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                    <span>Buka Tampilan Verifikasi Bank</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FIXED BOTTOM NAVIGATION BAR */}
        <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 max-w-[480px] mx-auto z-40">
          <div className="grid grid-cols-3 p-1.5 text-center">
            <button
              type="button"
              onClick={() => setActiveTab("cashier")}
              className={`py-2 px-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
                activeTab === "cashier"
                  ? "text-blue-700 font-bold bg-blue-50/70"
                  : "text-slate-500 hover:text-slate-900 font-medium"
              }`}
            >
              <Store className="w-4 h-4" strokeWidth={activeTab === "cashier" ? 2 : 1.75} />
              <span className="text-[11px]">Kasir</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("closebook")}
              className={`py-2 px-3 rounded-xl flex flex-col items-center gap-1 relative transition-all ${
                activeTab === "closebook"
                  ? "text-blue-700 font-bold bg-blue-50/70"
                  : "text-slate-500 hover:text-slate-900 font-medium"
              }`}
            >
              <div className="relative">
                <Lock className="w-4 h-4" strokeWidth={activeTab === "closebook" ? 2 : 1.75} />
                {pendingSummary.count > 0 && (
                  <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[9px] font-mono font-bold">
                    {pendingSummary.count}
                  </span>
                )}
              </div>
              <span className="text-[11px]">Tutup Buku</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("passport")}
              className={`py-2 px-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
                activeTab === "passport"
                  ? "text-blue-700 font-bold bg-blue-50/70"
                  : "text-slate-500 hover:text-slate-900 font-medium"
              }`}
            >
              <Award className="w-4 h-4" strokeWidth={activeTab === "passport" ? 2 : 1.75} />
              <span className="text-[11px]">Paspor</span>
            </button>
          </div>
        </nav>
      </div>

      {/* MODAL TAMBAH MENU */}
      {showAddMenuModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-antigravity max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Tambah Menu Baru</h3>
              <button
                type="button"
                onClick={() => setShowAddMenuModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>

            <form onSubmit={handleAddCustomMenu} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nama Menu</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kopi Tubruk"
                  value={newMenuForm.name}
                  onChange={(e) => setNewMenuForm({ ...newMenuForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Harga (Rp)</label>
                <input
                  type="number"
                  required
                  placeholder="10000"
                  value={newMenuForm.price}
                  onChange={(e) => setNewMenuForm({ ...newMenuForm, price: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Kategori</label>
                <select
                  value={newMenuForm.category}
                  onChange={(e) => setNewMenuForm({ ...newMenuForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none"
                >
                  <option value="Makanan">Makanan</option>
                  <option value="Minuman">Minuman</option>
                  <option value="Camilan">Camilan</option>
                  <option value="Paket">Paket</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMenuModal(false)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-sm"
                >
                  Simpan Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EKSPOR DOMPET WEB3 & UJI TC-19 */}
      {showExportWalletModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 space-y-4 border border-slate-200 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Ekspor Dompet Web3
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">BNB Smart Chain (Chain ID: 97)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowExportWalletModal(false);
                  setDecryptedWallet(null);
                  setExportPinInput("");
                  setExportError("");
                  setSoulboundTestResult(null);
                }}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!decryptedWallet ? (
              <form onSubmit={handleExportWallet} className="space-y-4 pt-1">
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    Otentikasi Keamanan Toko
                  </p>
                  <p className="text-[11px] text-amber-800/90 leading-relaxed">
                    Kunci privat dompet EVM memegang hak kepemilikan penuh atas Master Soulbound Token (SBT) dan Batch NFT toko Anda. Masukkan PIN kasir 6 digit untuk mendekripsi.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    PIN Kasir (6 Digit)
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    placeholder="••••••"
                    value={exportPinInput}
                    onChange={(e) => setExportPinInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-center tracking-widest text-base font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none"
                    autoFocus
                  />
                </div>

                {exportError && (
                  <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-2.5 rounded-xl border border-rose-200 text-center">
                    {exportError}
                  </p>
                )}

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowExportWalletModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={exportLoading || exportPinInput.length < 6}
                    className="flex-1 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    {exportLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Mendekripsi...</span>
                      </>
                    ) : (
                      <>
                        <Key className="w-3.5 h-3.5 text-amber-400" />
                        <span>Buka Kunci</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 pt-1 text-xs">
                {/* PUBLIC ADDRESS */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    Alamat Dompet Toko (Public Address)
                  </label>
                  <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-800">
                    <span className="truncate flex-1">{decryptedWallet.merchantAddress}</span>
                    <button
                      type="button"
                      onClick={handleCopyAddress}
                      className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 shrink-0"
                      title="Salin Alamat"
                    >
                      {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <a
                      href={`https://testnet.bscscan.com/address/${decryptedWallet.merchantAddress}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg hover:bg-slate-200 text-blue-600 shrink-0"
                      title="Lihat di BscScan"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* PRIVATE KEY */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 block">
                      Private Key Toko (Rahasia)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPrivateKey(!showPrivateKey)}
                      className="text-[10px] font-bold text-blue-700 hover:underline flex items-center gap-1"
                    >
                      {showPrivateKey ? (
                        <>
                          <EyeOff className="w-3 h-3" /> Sembunyikan
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" /> Tampilkan
                        </>
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-amber-300">
                    <span className="truncate flex-1 select-all">
                      {showPrivateKey ? decryptedWallet.privateKey : "••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyKey}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 shrink-0"
                      title="Salin Private Key"
                    >
                      {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* CAUTION BOX */}
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 space-y-1 text-[11px] leading-relaxed">
                  <p className="font-bold flex items-center gap-1.5 text-rose-800">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    Peringatan Keamanan Kritis
                  </p>
                  <p className="text-rose-900/90">
                    Jangan pernah bagikan Private Key ini ke siapa pun. Kunci ini memberikan kendali penuh terhadap tanda tangan kriptografis dan aset reputasi toko Anda.
                  </p>
                </div>

                {/* METAMASK IMPORT GUIDE */}
                <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-1.5 text-[11px] text-slate-700">
                  <p className="font-bold text-blue-950 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                    Cara Impor ke MetaMask / Trust Wallet:
                  </p>
                  <ol className="list-decimal list-inside space-y-0.5 text-slate-600 text-[10.5px]">
                    <li>Buka MetaMask &rarr; klik ikon Akun &rarr; pilih <b>Import Account</b></li>
                    <li>Tempelkan <i>Private Key</i> di atas &rarr; klik <b>Import</b></li>
                    <li>Pastikan jaringan aktif diatur ke <b>BNB Smart Chain Testnet</b></li>
                  </ol>
                </div>

                {/* TC-19 INTERACTIVE SOULBOUND VERIFICATION */}
                <div className="p-3.5 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-bold text-xs text-white">Uji Proteksi Soulbound (TC-19)</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-mono text-[9px] font-bold">
                      EIP-5192
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Simulasikan transaksi transfer NFT paspor dari dompet Anda ke alamat lain untuk membuktikan smart contract menolak pemindahtanganan.
                  </p>

                  <button
                    type="button"
                    onClick={handleTestSoulboundTransfer}
                    disabled={testingSoulbound}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                  >
                    {testingSoulbound ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Menguji ke Smart Contract BSC...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Jalankan Simulasi Transfer (Uji TC-19)</span>
                      </>
                    )}
                  </button>

                  {soulboundTestResult && (
                    <div className={`p-2.5 rounded-xl border text-[10.5px] space-y-1 ${
                      soulboundTestResult.testPassed
                        ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-200"
                        : "bg-rose-950/60 border-rose-500/50 text-rose-200"
                    }`}>
                      <div className="flex items-center gap-1.5 font-bold">
                        {soulboundTestResult.testPassed ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-300">TC-19 LULUS: Smart Contract Merevert Transfer!</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3.5 h-3.5 text-rose-400" />
                            <span>Gagal: {soulboundTestResult.error}</span>
                          </>
                        )}
                      </div>
                      {soulboundTestResult.revertReason && (
                        <p className="font-mono text-[10px] text-amber-300 bg-slate-950/80 p-1.5 rounded-lg border border-slate-800">
                          Revert: &quot;{soulboundTestResult.revertReason}&quot;
                        </p>
                      )}
                      <p className="text-[9.5px] text-slate-300">
                        {soulboundTestResult.explanation}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowExportWalletModal(false);
                      setDecryptedWallet(null);
                      setExportPinInput("");
                      setExportError("");
                      setSoulboundTestResult(null);
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL INSPEKSI VISUAL MASTER SOULBOUND TOKEN (ERC-5192) */}
      {showSbtVisualModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-5 space-y-4 border border-slate-200 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Visual Master Soulbound Token (ERC-5192)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSbtVisualModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visual SVG Card Preview */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-lg bg-slate-900">
              <img
                src={`/api/nft/merchant/${currentMerchant?.slug}/sbt`}
                alt="JejaK Master Soulbound Token"
                className="w-full h-auto object-contain select-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={handleDownloadSbt}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Unduh Paspor (SVG HD)</span>
              </button>
              <Link
                href="/merchant/passport"
                className="py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <span>Buka Lembar Paspor</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INSPEKSI VISUAL BATCH RECEIPT NFT (LAYER 2) */}
      {selectedBatchNftIndex !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto p-5 space-y-4 border border-slate-200 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Batch Receipt NFT #BATCH-{String(selectedBatchNftIndex).padStart(3, "0")}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBatchNftIndex(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visual SVG Struk Preview */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-900">
              <img
                src={`/api/nft/merchant/${currentMerchant?.slug}/batch/${selectedBatchNftIndex}`}
                alt={`Batch Receipt NFT #${selectedBatchNftIndex}`}
                className="w-full h-auto object-contain select-none"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleDownloadBatch(selectedBatchNftIndex)}
                className="flex-1 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Unduh Struk NFT (SVG)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedBatchNftIndex(null)}
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
