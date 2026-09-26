import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { MerchantModel } from "@/models/MerchantModel";
import { getProvider } from "@/lib/blockchain";

export const dynamic = "force-dynamic";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x764f397Bf9E54b534F9756ef897744F0B0D3De04";

const ERC721_TRANSFER_ABI = [
  "function transferFrom(address from, address to, uint256 tokenId) external",
  "function safeTransferFrom(address from, address to, uint256 tokenId) external",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function locked(uint256 tokenId) external view returns (bool)"
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { merchantId, pin, tokenId = "1" } = body;

    if (!merchantId || !pin) {
      return NextResponse.json(
        { success: false, error: "Merchant ID dan PIN wajib diisi" },
        { status: 400 }
      );
    }

    const merchant = await MerchantModel.findById(merchantId);
    if (!merchant) {
      return NextResponse.json(
        { success: false, error: "Merchant tidak ditemukan" },
        { status: 404 }
      );
    }

    if (merchant.pin !== pin.trim()) {
      return NextResponse.json(
        { success: false, error: "PIN kasir salah. Verifikasi ditolak." },
        { status: 403 }
      );
    }

    const provider = getProvider();
    const wallet = new ethers.Wallet(merchant.encryptedPrivateKey, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ERC721_TRANSFER_ABI, wallet);

    // Dummy recipient address to test unauthorized transfer
    const dummyRecipient = "0x000000000000000000000000000000000000dEaD";
    const numericTokenId = BigInt(tokenId);

    // Attempt to call transferFrom via staticCall / estimateGas
    let reverted = false;
    let revertReason = "";

    try {
      // staticCall simulates the transaction on BSC Testnet without spending gas
      await contract.transferFrom.staticCall(
        merchant.merchantAddress,
        dummyRecipient,
        numericTokenId
      );
      // If it doesn't revert, then soulbound failed!
      reverted = false;
    } catch (err: any) {
      reverted = true;
      revertReason = err?.reason || err?.message || "Execution reverted";
      if (revertReason.includes("Soulbound: Token is non-transferable")) {
        revertReason = "Soulbound: Token is non-transferable";
      }
    }

    // Check EIP-5192 locked status
    let isLockedOnChain = false;
    try {
      isLockedOnChain = await contract.locked(numericTokenId);
    } catch {}

    if (reverted) {
      return NextResponse.json({
        success: true,
        testPassed: true,
        isSoulboundLocked: isLockedOnChain,
        contractAddress: CONTRACT_ADDRESS,
        merchantAddress: merchant.merchantAddress,
        targetTokenId: tokenId.toString(),
        attemptedRecipient: dummyRecipient,
        revertReason,
        explanation: "Smart contract menolak pemindahan token secara on-chain. Token 100% permanen terikat ke dompet UMKM (Non-Transferable ERC-5192).",
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json({
        success: false,
        testPassed: false,
        error: "PERINGATAN: Transaksi transfer tidak di-revert oleh smart contract!",
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Error testing soulbound transfer:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menguji proteksi soulbound" },
      { status: 500 }
    );
  }
}
