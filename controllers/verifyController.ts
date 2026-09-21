import { prisma } from "@/lib/db";
import { verifyAnchorOnChain, getMerchantSBTFromChain } from "@/lib/blockchain";
import { calculateCreditMetrics } from "@/lib/creditMetrics";

export class VerifyController {
  /**
   * Mengambil daftar seluruh merchant aktif untuk Public Lender Directory
   */
  static async listRegisteredMerchants() {
    const merchants = await prisma.merchant.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            transactions: true,
            anchors: true,
          },
        },
        anchors: {
          orderBy: { periodDate: "desc" },
          take: 1,
        },
      },
    });

    return merchants.map((m) => {
      const { encryptedPrivateKey, pin, ...safeMerchant } = m;
      return safeMerchant;
    });
  }

  /**
   * Mengambil data audit lengkap untuk analis perbankan / lender
   */
  static async getMerchantAuditData(slug: string) {
    if (!slug) {
      throw new Error("Slug merchant diperlukan");
    }

    const merchant = await prisma.merchant.findUnique({
      where: { slug },
      include: {
        anchors: {
          orderBy: { anchoredAt: "desc" },
          include: {
            transactions: {
              orderBy: { createdAt: "asc" },
            },
          },
        },
        transactions: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!merchant) {
      throw new Error("Paspor kredit UMKM tidak ditemukan");
    }

    // 1. Hitung underwriting perbankan (Monthly Run Rate, Loan Plafond, dsb.)
    const creditMetrics = calculateCreditMetrics(merchant);

    // 2. Ambil Soulbound Token (SBT) & Batch Receipt NFTs dari BSC Testnet
    const sbt = await getMerchantSBTFromChain(merchant.merchantAddress);

    // 3. Verifikasi on-chain cryptographic anchor
    const verifiedBatches = await Promise.all(
      merchant.anchors.map(async (anchor, index) => {
        const isValidOnChain = await verifyAnchorOnChain(
          merchant.merchantAddress,
          anchor.dataHash
        );

        const batchIndex = merchant.anchors.length - index;
        const batchNFT = sbt?.batchNFTs?.find((b: any) => b.batchIndex === batchIndex);

        return {
          id: anchor.id,
          batchIndex,
          batchNFT,
          periodDate: anchor.periodDate,
          totalRevenue: anchor.totalRevenue,
          transactionCount: anchor.transactionCount,
          dataHash: anchor.dataHash,
          bscTxHash: anchor.bscTxHash,
          blockNumber: anchor.blockNumber,
          anchoredAt: anchor.anchoredAt,
          isValidOnChain,
          bscScanUrl: `https://testnet.bscscan.com/tx/${anchor.bscTxHash}`,
          invoices: anchor.transactions.map((tx) => ({
            id: tx.id,
            amount: tx.amount,
            paymentMethod: tx.paymentMethod,
            note: tx.note,
            proofImageUrl: tx.proofImageUrl,
            createdAt: tx.createdAt,
          })),
        };
      })
    );

    // 4. Analisis Bukti Kapasitas & Heuristik Anti-Fraud
    const allAnchoredTransactions = merchant.transactions.filter(
      (tx) => tx.status === "ANCHORED"
    );
    const transactionsWithProof = allAnchoredTransactions.filter(
      (tx) => tx.proofImageUrl !== null && tx.proofImageUrl !== ""
    ).length;

    const proofRatio =
      allAnchoredTransactions.length > 0
        ? Math.round((transactionsWithProof / allAnchoredTransactions.length) * 100)
        : 0;

    // Deteksi Wash-Trading & Dispersi Transaksi
    const amounts = allAnchoredTransactions.map((tx) => tx.amount);
    const uniqueAmounts = new Set(amounts).size;
    const amountEntropyRatio = amounts.length > 0 ? (uniqueAmounts / amounts.length) * 100 : 100;

    let aiFraudRiskScore = 96;
    let aiRiskLevel = "Sangat Rendah (High-Trust Authentic Flow)";
    const flags: string[] = [];

    if (amountEntropyRatio < 40 && amounts.length > 10) {
      aiFraudRiskScore -= 25;
      flags.push("Pola nominal belanja repetitif / identik terdeteksi");
    }

    if (proofRatio >= 50) {
      aiFraudRiskScore = Math.min(99, aiFraudRiskScore + 3);
    }

    if (merchant.anchors.length >= 3) {
      aiFraudRiskScore = Math.min(99, aiFraudRiskScore + 2);
    }

    if (aiFraudRiskScore < 75) {
      aiRiskLevel = "Perlu Klarifikasi Lapangan";
    }

    const { encryptedPrivateKey, pin, ...safeMerchant } = merchant;

    return {
      merchant: safeMerchant,
      sbt,
      creditMetrics,
      batches: verifiedBatches,
      aiRiskAssessment: {
        score: aiFraudRiskScore,
        riskLevel: aiRiskLevel,
        proofOfCapacityRatio: proofRatio,
        entropyScore: Math.round(amountEntropyRatio),
        flags,
      },
    };
  }
}
