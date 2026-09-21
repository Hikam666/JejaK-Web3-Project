async function testFlow() {
  console.log("=== Testing End-to-End Flow for JejaK ===");
  const baseUrl = "http://localhost:3000";

  // 1. Register new merchant
  const regPayload = {
    action: "register",
    businessName: "Toko Berkah Uji Coba",
    businessCategory: "Kuliner / Makanan",
    ownerName: "Hendra Wijaya",
    phone: "081999888777",
    pin: "123456",
    city: "Surabaya",
  };

  const regRes = await fetch(`${baseUrl}/api/auth/merchant`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(regPayload),
  });
  const regData = await regRes.json();
  console.log("1. Registration:", regData.success ? "SUCCESS" : "FAILED", regData.data?.slug);
  if (!regData.success) throw new Error(regData.error);

  const merchantId = regData.data.id;
  const slug = regData.data.slug;

  // 2. Login
  const loginRes = await fetch(`${baseUrl}/api/auth/merchant`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "login", phone: "081999888777", pin: "123456" }),
  });
  const loginData = await loginRes.json();
  console.log("2. Login:", loginData.success ? "SUCCESS" : "FAILED");

  // 3. Record Transactions
  const tx1 = await fetch(`${baseUrl}/api/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      merchantId,
      amount: 45000,
      paymentMethod: "QRIS",
      note: "Paket Nasi Ayam Geprek Special",
    }),
  });
  const tx1Data = await tx1.json();
  console.log("3. Add Transaction:", tx1Data.success ? "SUCCESS" : "FAILED", "Rp", tx1Data.data?.amount);

  // 4. Tutup Buku / Anchor to BSC Testnet
  console.log("4. Anchoring transaction to BSC Testnet smart contract...");
  const anchorRes = await fetch(`${baseUrl}/api/anchor`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ merchantId }),
  });
  const anchorData = await anchorRes.json();
  console.log("4. Anchoring Result:", anchorData.success ? "SUCCESS" : "FAILED");
  if (anchorData.success) {
    console.log("   - BSC Tx Hash:", anchorData.data?.bscTxHash);
    console.log("   - BscScan URL:", anchorData.data?.bscScanUrl);
  }

  // 5. Verify Public Underwriting Report
  const verifyRes = await fetch(`${baseUrl}/api/verify/${slug}`);
  const verifyData = await verifyRes.json();
  console.log("5. Verify Endpoint:", verifyData.success ? "SUCCESS" : "FAILED");
  if (verifyData.success) {
    console.log("   - Monthly Run Rate:", verifyData.data.creditMetrics?.monthlyRunRate);
    console.log("   - Recommended Plafond:", verifyData.data.creditMetrics?.recommendedLoanPlafond);
    console.log("   - On-chain Valid:", verifyData.data.batches?.[0]?.isValidOnChain);
    console.log("   - Fraud Score:", verifyData.data.aiRiskAssessment?.score);
  }

  // 6. Clean up test record to keep database production-ready
  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();
  await prisma.transaction.deleteMany({ where: { merchantId } });
  await prisma.anchorRecord.deleteMany({ where: { merchantId } });
  await prisma.merchant.delete({ where: { id: merchantId } });
  await prisma.$disconnect();
  console.log("6. Cleaned test merchant. Database is 100% clean for deployment!");
}

testFlow().catch(console.error);
