/**
 * Kalkulasi Metrik Kelayakan Kredit UMKM untuk Analis Bank:
 * 1. Omzet Rata-rata Bulanan (Monthly Run-Rate 30 Hari)
 * 2. Kapasitas Cicilan Maksimal (Debt Service Capacity: 20% margin laba x 50%)
 * 3. Rekomendasi Plafon Pinjaman Bank
 * 4. Konsistensi Penjualan (Consistency Score)
 * 5. Akumulasi Total & Rekam Jejak (Track Record Longevity)
 */
export function calculateCreditMetrics(merchant: any) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const anchors = merchant.anchors || [];

  // 1. Filter batch dalam 30 hari terakhir
  const recentBatches = anchors.filter(
    (a: any) => new Date(a.anchoredAt) >= thirtyDaysAgo
  );

  const actual30DayRevenue = recentBatches.reduce(
    (acc: number, a: any) => acc + (a.totalRevenue || 0),
    0
  );

  const totalVerifiedRevenue = anchors.reduce(
    (acc: number, a: any) => acc + (a.totalRevenue || 0),
    0
  );

  const totalAnchoredTxs = anchors.reduce(
    (acc: number, a: any) => acc + (a.transactionCount || 0),
    0
  );

  // Jika toko baru aktif <30 hari, kita gunakan total omzet terkunci sebagai basis run-rate
  const monthlyRunRate = actual30DayRevenue > 0 ? actual30DayRevenue : totalVerifiedRevenue;

  // Rata-rata laba bersih UMKM sektor kuliner / ritel mikro diasumsikan ~20%
  const estimatedMonthlyNetProfit = Math.round(monthlyRunRate * 0.20);

  // Kapasitas cicilan bulanan aman (Debt Service Capacity: ~50% dari laba bersih bulanan)
  const monthlyInstallmentCapacity = Math.round(estimatedMonthlyNetProfit * 0.50);

  // Rekomendasi Plafon Pinjaman Modal Kerja Bank (3 - 6x kapasitas cicilan bulanan, atau 50% dari omzet bulanan)
  const recommendedLoanPlafond = Math.round(monthlyRunRate * 0.50);

  // 2. Konsistensi Penjualan (Consistency Score)
  const distinctDates = new Set(
    anchors.map((a: any) =>
      a.periodDate ? new Date(a.periodDate).toISOString().split("T")[0] : ""
    ).filter(Boolean)
  );
  const daysActive = distinctDates.size;
  // 70% base + 6% per hari aktif pencatatan (max 98%)
  const consistencyScore = Math.min(98, Math.max(70, 70 + daysActive * 6));
  const consistencyLevel =
    consistencyScore >= 85
      ? "Sangat Konsisten (Aktif Harian)"
      : (consistencyScore >= 75 ? "Konsisten Teratur" : "Toko Baru");

  // 3. Akumulasi Total & Rekam Jejak (Track Record Longevity)
  const daysSinceJoined = merchant.createdAt
    ? Math.max(1, Math.ceil((now.getTime() - new Date(merchant.createdAt).getTime()) / (1000 * 60 * 60 * 24)))
    : 1;

  // Proof-of-Capacity Ratio
  const allTxs = merchant.transactions || [];
  const anchoredTxs = allTxs.filter((t: any) => t.status === "ANCHORED");
  const txsWithProof = anchoredTxs.filter(
    (t: any) => t.proofImageUrl && t.proofImageUrl.trim() !== ""
  ).length;

  const proofRatio =
    anchoredTxs.length > 0
      ? Math.round((txsWithProof / anchoredTxs.length) * 100)
      : 0;

  const badge =
    totalVerifiedRevenue >= 10000000
      ? "Gold Merchant"
      : (totalVerifiedRevenue >= 1000000 ? "Silver Merchant" : "Bronze Merchant");

  return {
    monthlyRunRate,
    actual30DayRevenue,
    estimatedMonthlyNetProfit,
    monthlyInstallmentCapacity,
    recommendedLoanPlafond,
    consistencyScore,
    consistencyLevel,
    daysActive,
    allTimeVerifiedRevenue: totalVerifiedRevenue,
    totalVerifiedRevenue,
    totalAnchoredTxs,
    totalAnchoredBatches: anchors.length,
    daysSinceJoined,
    proofRatio,
    transactionsWithProof: txsWithProof,
    totalTransactionsCount: anchoredTxs.length,
    badge,
  };
}
