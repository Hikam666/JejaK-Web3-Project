import { MerchantModel } from "@/models/MerchantModel";
import { TransactionModel } from "@/models/TransactionModel";
import { AnchorRecordModel } from "@/models/AnchorRecordModel";
import { calculateBatchHash } from "@/lib/hash";
import { recordAnchorOnChain } from "@/lib/blockchain";
import { prisma } from "@/lib/db";

export class AnchorController {
  static async anchorPendingTransactions(merchantId: string) {
    if (!merchantId) {
      throw new Error("merchantId wajib disertakan");
    }

    const merchant = await MerchantModel.findById(merchantId);
    if (!merchant) {
      throw new Error("Merchant tidak ditemukan");
    }

    const pendingTransactions = await TransactionModel.getPendingByMerchantId(merchantId);
    if (pendingTransactions.length === 0) {
      throw new Error("Tidak ada transaksi baru untuk dikunci saat ini.");
    }

    const totalRevenue = pendingTransactions.reduce((acc, tx) => acc + tx.amount, 0);
    const transactionCount = pendingTransactions.length;
    const transactionIds = pendingTransactions.map((tx) => tx.id);
    const periodDate = new Date().toISOString().split("T")[0];

    // 1. Calculate Cryptographic Keccak256 Hash Server-Side
    const dataHash = calculateBatchHash({
      merchantAddress: merchant.merchantAddress,
      totalRevenue,
      transactionCount,
      transactionIds,
      periodDate,
    });

    console.log(`[Relayer Controller] Anchoring for ${merchant.businessName}:`);
    console.log(`- Data Hash: ${dataHash}`);
    console.log(`- Total Revenue: Rp${totalRevenue.toLocaleString("id-ID")}`);
    console.log(`- Count: ${transactionCount} txs`);

    // 2. Execute Relayer Gasless Transaction to BSC Testnet
    const bscResult = await recordAnchorOnChain(
      merchant.merchantAddress,
      dataHash,
      totalRevenue,
      transactionCount
    );

    console.log(`[Relayer Controller] BSC TX Success: ${bscResult.txHash}`);

    // 3. Save AnchorRecord and update transactions status atomically
    const savedAnchor = await prisma.$transaction(async (tx) => {
      const anchor = await tx.anchorRecord.create({
        data: {
          merchantId,
          transactionCount,
          totalRevenue,
          dataHash,
          bscTxHash: bscResult.txHash,
          blockNumber: bscResult.blockNumber,
          status: "CONFIRMED",
        },
      });

      await tx.transaction.updateMany({
        where: {
          id: { in: transactionIds },
        },
        data: {
          status: "ANCHORED",
          anchorId: anchor.id,
        },
      });

      await tx.relayerLog.create({
        data: {
          txHash: bscResult.txHash,
          merchantId,
          action: "RECORD_ANCHOR",
          gasFeeBnb: bscResult.gasFeeBnb,
          status: "SUCCESS",
        },
      });

      return anchor;
    });

    return {
      anchor: savedAnchor,
      bscScanUrl: `https://testnet.bscscan.com/tx/${bscResult.txHash}`,
      bscTxHash: bscResult.txHash,
      dataHash,
      gasFeeBnb: bscResult.gasFeeBnb,
      batchTokenId: bscResult.batchTokenId,
      masterTokenId: bscResult.masterTokenId,
    };
  }
}
