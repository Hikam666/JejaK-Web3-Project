import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMerchantSBTFromChain } from "@/lib/blockchain";
import { generateMasterSbtSvg } from "@/lib/nftRenderer";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const merchant = await prisma.merchant.findUnique({
      where: { slug },
      include: {
        anchors: {
          orderBy: { periodDate: "desc" },
        },
      },
    });

    if (!merchant) {
      return new NextResponse("Merchant tidak ditemukan", { status: 404 });
    }

    // Try fetching on-chain SBT status
    const sbt = await getMerchantSBTFromChain(merchant.merchantAddress).catch(() => null);

    const totalAnchoredRevenue = merchant.anchors.reduce((acc, a) => acc + a.totalRevenue, 0);
    const totalBatches = sbt?.totalBatches || merchant.anchors.length;
    
    // Determine tier & score
    let tier = sbt?.tier || 1;
    let score = sbt?.creditScore || 75;

    if (!sbt && merchant.anchors.length > 0) {
      if (totalBatches >= 3 && totalAnchoredRevenue >= 50000000) {
        tier = 3;
        score = 85;
      } else if (totalBatches >= 2) {
        tier = 2;
        score = 80;
      } else {
        tier = 1;
        score = 75;
      }
    }

    const svg = generateMasterSbtSvg({
      umkmId: `JK-${merchant.id.slice(0, 8).toUpperCase()}`,
      businessName: merchant.businessName,
      ownerWallet: merchant.merchantAddress,
      category: merchant.businessCategory,
      region: `${merchant.city}, Indonesia`,
      reputationScore: score,
      tier,
      totalBatches,
    });

    return new NextResponse(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=60, s-maxage=300",
      },
    });
  } catch (error: any) {
    console.error("Error generating master SBT SVG:", error);
    return new NextResponse("Error generating SVG", { status: 500 });
  }
}
