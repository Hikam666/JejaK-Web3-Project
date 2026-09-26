import { NextResponse } from "next/server";
import { getAnchorContract } from "@/lib/blockchain";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { tokenId: string } }
) {
  try {
    const tokenId = params.tokenId;
    const url = new URL(request.url);
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    const contract = getAnchorContract();

    // Check token type from contract (Solidity enum: 0 = MASTER_SBT, 1 = BATCH_RECEIPT)
    let tokenType = 0;
    try {
      tokenType = Number(await contract.tokenTypes(tokenId));
    } catch {}

    const imageUrl = `${baseUrl}/api/nft/image/${tokenId}`;

    if (tokenType === 1) {
      // BATCH_RECEIPT metadata
      let batchDet: any = null;
      try {
        batchDet = await contract.getBatchReceiptDetails(tokenId);
      } catch {}

      const batchIndex = batchDet ? Number(batchDet[1]) : Number(tokenId);
      const totalRevenue = batchDet ? Number(batchDet[2]) : 0;
      const txCount = batchDet ? Number(batchDet[3]) : 0;
      const dataHash = batchDet ? batchDet[4] : "";
      const timestamp = batchDet ? new Date(Number(batchDet[5]) * 1000).toISOString() : new Date().toISOString();

      const metadata = {
        name: `JejaK Settlement Receipt #BATCH-${String(batchIndex).padStart(3, "0")}`,
        description: "Proof-of-Close settlement anchor on BNB Smart Chain. Cryptographically verified merchant register ledger.",
        image: imageUrl,
        external_url: `${baseUrl}/verify`,
        attributes: [
          { trait_type: "Batch Index", value: batchIndex },
          { trait_type: "Total Revenue (IDR)", value: totalRevenue },
          { trait_type: "Transaction Count", value: txCount },
          { trait_type: "Integrity Hash", value: dataHash },
          { trait_type: "Anchor Timestamp", value: timestamp },
          { trait_type: "Token Type", value: "Settlement Receipt (ERC-721)" },
          { trait_type: "Network", value: "BNB Smart Chain Testnet" },
        ],
      };

      return NextResponse.json(metadata, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=60, s-maxage=300",
        },
      });
    } else {
      // MASTER_SBT metadata
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
        });
      }

      const tierNum = badge ? Number(badge.tier) : 1;
      const tierStr = tierNum === 4 ? "Platinum" : (tierNum === 3 ? "Gold" : (tierNum === 2 ? "Silver" : "Bronze"));
      const creditScore = badge ? Number(badge.creditScore) : 75;
      const totalRevenue = badge ? Number(badge.totalRevenue) : 0;
      const totalBatches = badge ? Number(badge.totalBatches) : 1;

      const metadata = {
        name: `JejaK Master Credit Passport #${tokenId} - ${merchant?.businessName || "UMKM Indonesia"}`,
        description: "Non-transferable Soulbound Credit Passport on BNB Chain (ERC-5192). Live cryptographic creditworthiness accreditation for Indonesian MSMEs.",
        image: imageUrl,
        external_url: merchant ? `${baseUrl}/verify/${merchant.slug}` : `${baseUrl}/verify`,
        attributes: [
          { trait_type: "Tier", value: `${tierStr} Credential` },
          { trait_type: "Credit Score", value: creditScore },
          { trait_type: "Total Anchored Revenue (IDR)", value: totalRevenue },
          { trait_type: "Total Batches", value: totalBatches },
          { trait_type: "Soulbound Status", value: "Locked (Non-Transferable)" },
          { trait_type: "Standard", value: "ERC-5192 / ERC-721" },
          { trait_type: "Network", value: "BNB Smart Chain Testnet" },
        ],
      };

      return NextResponse.json(metadata, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=60, s-maxage=300",
        },
      });
    }
  } catch (error: any) {
    console.error("Error generating NFT metadata:", error);
    return NextResponse.json(
      { error: "Error generating metadata" },
      { status: 500 }
    );
  }
}
