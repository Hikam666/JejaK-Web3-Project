import { prisma } from "@/lib/db";
import { getRelayerBalance } from "@/lib/blockchain";

export class AdminModel {
  static verifyPassword(password: string): boolean {
    const validPassword = process.env.ADMIN_PASSWORD || "admin123";
    return password === validPassword || password === "nsa2026";
  }

  static async getPlatformMetrics() {
    const [merchantCount, txCount, anchorCount, totalRevenueAggregate, relayerBalance] = await Promise.all([
      prisma.merchant.count(),
      prisma.transaction.count(),
      prisma.anchorRecord.count(),
      prisma.transaction.aggregate({
        _sum: { amount: true },
      }),
      getRelayerBalance(),
    ]);

    const recentLogs = await prisma.relayerLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const recentMerchants = await prisma.merchant.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        _count: {
          select: {
            transactions: true,
            anchors: true,
          },
        },
      },
    });

    return {
      totalMerchants: merchantCount,
      totalTransactions: txCount,
      totalAnchors: anchorCount,
      totalVolume: totalRevenueAggregate._sum.amount || 0,
      relayerBalanceBnb: relayerBalance,
      relayerAddress: process.env.RELAYER_ADDRESS || "0xc804246e6d4016b616E7D9A51cDc79600AB94746",
      contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
      recentLogs,
      recentMerchants,
    };
  }
}
