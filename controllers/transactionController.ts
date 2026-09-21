import { prisma } from "@/lib/db";
import { TransactionModel } from "@/models/TransactionModel";

export interface AddTransactionDTO {
  merchantId: string;
  amount: number;
  paymentMethod?: string;
  note?: string;
  proofImageUrl?: string;
}

export class TransactionController {
  static async getTransactionsByMerchant(merchantId: string, status?: string) {
    if (!merchantId) {
      throw new Error("merchantId diperlukan");
    }

    const whereClause: any = { merchantId };
    if (status) {
      whereClause.status = status;
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    const pendingSummary = await prisma.transaction.aggregate({
      where: { merchantId, status: "PENDING_ANCHOR" },
      _sum: { amount: true },
      _count: { id: true },
    });

    return {
      transactions,
      pending: {
        totalAmount: pendingSummary._sum.amount || 0,
        count: pendingSummary._count.id || 0,
      },
    };
  }

  static async recordTransaction(dto: AddTransactionDTO) {
    if (!dto.merchantId || !dto.amount) {
      throw new Error("merchantId dan nominal amount wajib diisi");
    }

    const numAmount = parseFloat(dto.amount.toString());
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error("Nominal transaksi harus berupa angka positif");
    }

    const newTx = await TransactionModel.create({
      merchantId: dto.merchantId,
      amount: numAmount,
      paymentMethod: dto.paymentMethod || "QRIS",
      note: dto.note?.trim() || "Transaksi POS Kasir",
      proofImageUrl: dto.proofImageUrl,
    });

    return newTx;
  }
}
