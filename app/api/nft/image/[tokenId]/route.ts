import { NextResponse } from "next/server";
import { getAnchorContract } from "@/lib/blockchain";
import { prisma } from "@/lib/db";
import { generateMasterSbtSvg, generateBatchReceiptSvg } from "@/lib/nftRenderer";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { tokenId: string } }
) {
  try {
    const tokenId = params.tokenId;
    const contract = getAnchorContract();

    // Check token type from contract (Solidity enum: 0 = MASTER_SBT, 1 = BATCH_RECEIPT)
    let tokenType = 0; // Default to MASTER_SBT
    try {
      const typeNum = await contract.tokenTypes(tokenId);
      tokenType = Number(typeNum);
    } catch {
      // Fallback
    }

    if (tokenType === 1) {
      // BATCH_RECEIPT
      let batchDet: any = null;
      try {
        batchDet = await contract.getBatchReceiptDetails(tokenId);
      } catch {}

      const merchantAddress = batchDet ? batchDet[0] : null;
      const batchIndex = batchDet ? Number(batchDet[1]) : Number(tokenId);
      const totalRevenue = batchDet ? Number(batchDet[2]) : 1500000;
      const txCount = batchDet ? Number(batchDet[3]) : 15;
      const dataHash = batchDet ? batchDet[4] : "0x0";

      let businessName = "UMKM Binaan JejaK";
      if (merchantAddress) {
        const m = await prisma.merchant.findFirst({
          where: {
            merchantAddress: {
              equals: merchantAddress,
              mode: "insensitive",
            },
          },
        });
        if (m) businessName = m.businessName;
      }

      const svg = generateBatchReceiptSvg({
        batchNumber: batchIndex,
        businessName,
        totalRevenue,
        txCount: `${txCount} Transaksi Kasir`,
        dataHash,
        bscTxHash: "0x" + "1".repeat(64),
      });

      return new NextResponse(svg, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml; charset=utf-8",
          "Cache-Control": "public, max-age=60, s-maxage=300",
        },
      });
    } else {
      // MASTER_SBT
      let badge: any = null;
      let ownerAddr: string = "";
      try {
        ownerAddr = await contract.ownerOf(tokenId);
        badge = await contract.masterBadges(tokenId);
      } catch {}

      let merchant = null;
      if (ownerAddr && ownerAddr !== "0x0000000000000000000000000000000000000000") {
        merchant = await prisma.merchant.findFirst({
          where: {
            merchantAddress: {
              equals: ownerAddr,
              mode: "insensitive",
            },
          },
          include: { anchors: true },
        });
      }

      if (!merchant) {
        merchant = await prisma.merchant.findFirst({
          include: { anchors: true },
        });
      }

      const tier = badge ? Number(badge.tier) : (merchant && merchant.anchors.length >= 3 ? 3 : 1);
      const creditScore = badge ? Number(badge.creditScore) : 75;
      const totalRevenue = badge ? Number(badge.totalRevenue) : (merchant?.anchors.reduce((a, b) => a + b.totalRevenue, 0) || 0);

      const svg = generateMasterSbtSvg({
        umkmId: merchant ? `JK-${merchant.id.slice(0, 8).toUpperCase()}` : `JK-SBT-${tokenId}`,
        businessName: merchant ? merchant.businessName : "UMKM Binaan JejaK",
        ownerWallet: merchant ? merchant.merchantAddress : ownerAddr || "0x...",
        category: merchant ? merchant.businessCategory : "Usaha Mikro",
        region: merchant ? `${merchant.city}, Indonesia` : "Indonesia",
        reputationScore: creditScore,
        tier,
      });

      return new NextResponse(svg, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml; charset=utf-8",
          "Cache-Control": "public, max-age=60, s-maxage=300",
        },
      });
    }
  } catch (error: any) {
    console.error("Error generating NFT image:", error);
    return new NextResponse("Error generating NFT image", { status: 500 });
  }
}
