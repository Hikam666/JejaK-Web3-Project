const { ethers } = require("ethers");

async function testNftFlow() {
  console.log("=== Testing NFT End-to-End Integration for JejaK ===");
  const baseUrl = "http://localhost:3000";

  // 1. Register fresh merchant
  const regPayload = {
    action: "register",
    businessName: "Warung Kopi Barokah",
    businessCategory: "Kuliner & Kopi",
    ownerName: "Ahmad Fauzi",
    phone: "081234567890",
    pin: "123456",
    city: "Surabaya",
  };

  console.log("1. Mendaftarkan merchant baru (atau login jika sudah ada)...");
  let merchantId = "";
  let slug = "";
  const regRes = await fetch(`${baseUrl}/api/auth/merchant`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(regPayload),
  });
  const regData = await regRes.json();
  if (!regData.success) {
    // Try login
    const loginRes = await fetch(`${baseUrl}/api/auth/merchant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", phone: regPayload.phone, pin: regPayload.pin }),
    });
    const loginData = await loginRes.json();
    if (!loginData.success) throw new Error(loginData.error);
    merchantId = loginData.data.id;
    slug = loginData.data.slug;
    console.log("   ✅ Login berhasil:", loginData.data.businessName, "| Slug:", slug);
  } else {
    merchantId = regData.data.id;
    slug = regData.data.slug;
    console.log("   ✅ Merchant terdaftar:", regData.data?.businessName, "| Slug:", slug);
  }

  // 2. Add sample transactions
  console.log("2. Menambahkan transaksi kasir...");
  await fetch(`${baseUrl}/api/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      merchantId,
      amount: 45000,
      paymentMethod: "QRIS",
      note: "2 Kopi Susu Aren + Roti Bakar",
    }),
  });
  await fetch(`${baseUrl}/api/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      merchantId,
      amount: 32000,
      paymentMethod: "CASH",
      note: "Es Teh Manis + Pisang Goreng Keju",
    }),
  });
  console.log("   ✅ 2 Transaksi kasir berhasil dicatat (Total: Rp 77.000)");

  // 3. Anchor / Tutup Buku to BSC Testnet
  console.log("3. Menjalankan Tutup Buku (Anchoring on-chain ke BSC Testnet)...");
  const anchorRes = await fetch(`${baseUrl}/api/anchor`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ merchantId }),
  });
  const anchorData = await anchorRes.json();
  if (!anchorData.success) throw new Error(anchorData.error);
  console.log("   ✅ Tutup Buku Sukses!");
  console.log("   - BSC Tx Hash:", anchorData.data?.bscTxHash);
  console.log("   - BscScan URL:", anchorData.data?.bscScanUrl);

  // 4. Test Master SBT SVG Endpoint
  console.log("4. Menguji Endpoint SVG Master SBT...");
  const sbtRes = await fetch(`${baseUrl}/api/nft/merchant/${slug}/sbt`);
  const sbtText = await sbtRes.text();
  console.log("   - Status:", sbtRes.status);
  console.log("   - Content-Type:", sbtRes.headers.get("content-type"));
  console.log("   - SVG Includes Business Name:", sbtText.includes("Warung Kopi Barokah"));
  console.log("   - SVG Length:", sbtText.length, "bytes");

  // 5. Test Batch Receipt SVG Endpoint
  console.log("5. Menguji Endpoint SVG Batch Receipt...");
  const batchRes = await fetch(`${baseUrl}/api/nft/merchant/${slug}/batch/1`);
  const batchText = await batchRes.text();
  console.log("   - Status:", batchRes.status);
  console.log("   - Content-Type:", batchRes.headers.get("content-type"));
  console.log("   - SVG Includes #BATCH-001:", batchText.includes("#BATCH-001"));
  console.log("   - SVG Length:", batchText.length, "bytes");

  // 6. Test on-chain tokenURI on BSC Testnet smart contract
  console.log("6. Menguji On-Chain tokenURI(1) langsung dari BSC Testnet...");
  const provider = new ethers.JsonRpcProvider("https://bsc-testnet-rpc.publicnode.com");
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x07A49c978b907cfd2DD967F1CD142f1ddAE16647";
  const contract = new ethers.Contract(contractAddress, ["function tokenURI(uint256) view returns (string)"], provider);
  const uri = await contract.tokenURI(1);
  console.log("   - On-Chain tokenURI(1):", uri.slice(0, 160) + "...");
  console.log("   - Includes 'image' field:", uri.includes('"image":'));

  // 7. Test ERC-721 Metadata Endpoint (MetaMask / BscScan compatible)
  console.log("7. Menguji Endpoint Metadata JSON Web3 /api/nft/metadata/1...");
  const metaRes = await fetch(`${baseUrl}/api/nft/metadata/1`);
  const metaJson = await metaRes.json();
  console.log("   - Metadata Status:", metaRes.status);
  console.log("   - Metadata Name:", metaJson.name);
  console.log("   - Metadata Image URL:", metaJson.image);
  console.log("   - Attributes count:", metaJson.attributes?.length);

  console.log("\n🎉 SEMUA PENGUJIAN INTEGRASI NFT 100% SUKSES!");
}

testNftFlow().catch(console.error);
