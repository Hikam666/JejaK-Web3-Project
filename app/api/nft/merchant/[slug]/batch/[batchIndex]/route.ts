import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateBatchReceiptSvg } from "@/lib/nftRenderer";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { slug: string; batchIndex: string } }
) {
  try {
    const { slug, batchIndex } = params;
    const batchNum = parseInt(batchIndex, 10);

    const merchant = await prisma.merchant.findUnique({
      where: { slug },
      include: {
        anchors: {
          orderBy: { periodDate: "asc" },
          include: {
            transactions: true,
          },
        },
      },
    });

    if (!merchant) {
      return new NextResponse("Merchant tidak ditemukan", { status: 404 });
    }

    if (merchant.anchors.length === 0) {
      return new NextResponse("Belum ada batch settlement untuk merchant ini", { status: 404 });
    }

    // Select specific anchor by 1-based index, fallback to latest
    const anchor = isNaN(batchNum) || batchNum < 1 || batchNum > merchant.anchors.length
      ? merchant.anchors[merchant.anchors.length - 1]
      : merchant.anchors[batchNum - 1];

    // Calculate payment breakdown
    const txs = anchor.transactions || [];
    const qrisCount = txs.filter((t) => t.paymentMethod === "QRIS").length;
    const cashCount = txs.filter((t) => t.paymentMethod === "CASH").length;
    const totalTxs = txs.length || anchor.transactionCount || 1;
    const qrisPct = Math.round((qrisCount / totalTxs) * 100) || 80;
    const cashPct = 100 - qrisPct;

    const proofCount = txs.filter((t) => Boolean(t.proofImageUrl)).length;
    const proofRatioPct = txs.length > 0 ? Math.round((proofCount / txs.length) * 100) : 100;

    const settlementDateFormatted = new Date(anchor.periodDate || anchor.anchoredAt).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }) + ", " + new Date(anchor.anchoredAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";

    const svg = generateBatchReceiptSvg({
      batchNumber: isNaN(batchNum) ? merchant.anchors.length : batchNum,
      businessName: merchant.businessName,
      settlementDate: settlementDateFormatted,
      totalRevenue: anchor.totalRevenue,
      txCount: `${anchor.transactionCount} Transaksi Kasir`,
      paymentBreakdown: `QRIS (${qrisPct}%) • Tunai (${cashPct}%)`,
      proofRatio: `${proofRatioPct}% Bukti Nota Terlampir`,
      dataHash: anchor.dataHash,
      bscTxHash: anchor.bscTxHash,
      blockNumber: anchor.blockNumber ? `Block #${anchor.blockNumber}` : "Block BSC",
    });

    return new NextResponse(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=60, s-maxage=300",
      },
    });
  } catch (error: any) {
    console.error("Error generating batch receipt SVG:", error);
    return new NextResponse("Error generating SVG", { status: 500 });
  }
}
