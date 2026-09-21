import { prisma } from "@/lib/db";

export interface CreateAnchorInput {
  merchantId: string;
  transactionCount: number;
  totalRevenue: number;
  dataHash: string;
  bscTxHash: string;
  blockNumber?: number;
  status?: string;
}

export class AnchorRecordModel {
  static async create(input: CreateAnchorInput) {
    return prisma.anchorRecord.create({
      data: {
        merchantId: input.merchantId,
        transactionCount: input.transactionCount,
        totalRevenue: input.totalRevenue,
        dataHash: input.dataHash,
        bscTxHash: input.bscTxHash,
        blockNumber: input.blockNumber,
        status: input.status || "CONFIRMED",
      },
    });
  }

  static async findByMerchantId(merchantId: string, limit: number = 20) {
    return prisma.anchorRecord.findMany({
      where: { merchantId },
      orderBy: { periodDate: "desc" },
      take: limit,
      include: {
        transactions: {
          select: {
            id: true,
            amount: true,
            paymentMethod: true,
            createdAt: true,
          },
        },
      },
    });
  }

  static async getLatestByMerchantId(merchantId: string) {
    return prisma.anchorRecord.findFirst({
      where: { merchantId },
      orderBy: { periodDate: "desc" },
    });
  }

  static async findByDataHash(dataHash: string) {
    return prisma.anchorRecord.findFirst({
      where: { dataHash },
      include: {
        merchant: true,
        transactions: true,
      },
    });
  }

  static async count() {
    return prisma.anchorRecord.count();
  }

  static async getTotalAnchoredRevenue() {
    const aggregate = await prisma.anchorRecord.aggregate({
      _sum: {
        totalRevenue: true,
      },
    });
    return aggregate._sum.totalRevenue || 0;
  }
}
