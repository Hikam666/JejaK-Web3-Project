import { prisma } from "@/lib/db";

export interface CreateTransactionInput {
  merchantId: string;
  amount: number;
  paymentMethod?: string;
  note?: string;
  proofImageUrl?: string;
}

export class TransactionModel {
  static async create(input: CreateTransactionInput) {
    return prisma.transaction.create({
      data: {
        merchantId: input.merchantId,
        amount: input.amount,
        paymentMethod: input.paymentMethod || "QRIS",
        note: input.note,
        proofImageUrl: input.proofImageUrl,
        status: "PENDING_ANCHOR",
      },
    });
  }

  static async findByMerchantId(merchantId: string, limit: number = 50) {
    return prisma.transaction.findMany({
      where: { merchantId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        anchor: {
          select: {
            bscTxHash: true,
            dataHash: true,
            status: true,
          },
        },
      },
    });
  }

  static async getPendingByMerchantId(merchantId: string) {
    return prisma.transaction.findMany({
      where: {
        merchantId,
        status: "PENDING_ANCHOR",
      },
      orderBy: { createdAt: "asc" },
    });
  }

  static async markAnchored(transactionIds: string[], anchorId: string) {
    return prisma.transaction.updateMany({
      where: {
        id: { in: transactionIds },
      },
      data: {
        status: "ANCHORED",
        anchorId,
      },
    });
  }

  static async count() {
    return prisma.transaction.count();
  }

  static async getTotalRevenue() {
    const aggregate = await prisma.transaction.aggregate({
      _sum: {
        amount: true,
      },
    });
    return aggregate._sum.amount || 0;
  }
}
