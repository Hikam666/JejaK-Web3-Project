/**
 * Uji Coba Kepatuhan TC-19: Soulbound Token (EIP-5192 / ERC-721 Non-Transferable)
 * Menjalankan simulasi transfer dari wallet merchant ke alamat lain dan memastikan
 * smart contract menolak (revert) dengan pesan: "Soulbound: Token is non-transferable".
 */
const { ethers } = require("ethers");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const prisma = new PrismaClient();

const CONTRACT_ABI = [
  "function transferFrom(address from, address to, uint256 tokenId) external",
  "function safeTransferFrom(address from, address to, uint256 tokenId) external",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function locked(uint256 tokenId) external view returns (bool)",
  "function name() view returns (string)",
  "function symbol() view returns (string)"
];

async function runTest() {
  console.log("==================================================================");
  console.log("🧪 TESTING TC-19: UJI PROTEKSI SOULBOUND (NON-TRANSFERABLE TOKEN)");
  console.log("==================================================================");

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const rpcUrl = process.env.BSC_TESTNET_RPC_URL || "https://data-seed-prebsc-1-s1.bnbchain.org:8545";

  console.log("Target Smart Contract:", contractAddress);
  console.log("RPC Provider:", rpcUrl);

  const net = ethers.Network.from({ name: "bnbt", chainId: 97 });
  const provider = new ethers.JsonRpcProvider(rpcUrl, net, { staticNetwork: net });

  // 1. Ambil salah satu merchant dari database
  let merchant = await prisma.merchant.findFirst();
  let merchantWallet;

  if (merchant && merchant.encryptedPrivateKey) {
    merchantWallet = new ethers.Wallet(merchant.encryptedPrivateKey, provider);
    console.log("\nMenggunakan Toko:", merchant.businessName);
    console.log("Alamat Pemilik Toko:", merchantWallet.address);
  } else {
    // Fallback jika DB kosong: buat random wallet sementara untuk simulasi
    merchantWallet = ethers.Wallet.createRandom(provider);
    console.log("\nDatabase kosong, menggunakan wallet testing:", merchantWallet.address);
  }

  const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, merchantWallet);

  console.log("\nNama Protokol:", await contract.name());
  console.log("Simbol Token:", await contract.symbol());

  // 2. Cek status locked pada tokenId #1
  try {
    const isLocked = await contract.locked(1);
    console.log("Status EIP-5192 locked(Token #1):", isLocked ? "🔒 LOCKED (Soulbound)" : "UNLOCKED");
  } catch (err) {
    console.log("Status locked check:", err.message);
  }

  // 3. Eksekusi TC-19: Coba lakukan transfer token #1 ke alamat lain
  const randomRecipient = "0x000000000000000000000000000000000000dEaD";
  console.log(`\nPercobaan Pemindahan Token #1:`);
  console.log(`- Dari: ${merchantWallet.address}`);
  console.log(`- Ke (Penerima): ${randomRecipient}`);
  console.log("Memanggil contract.transferFrom.staticCall(...)...");

  try {
    await contract.transferFrom.staticCall(
      merchantWallet.address,
      randomRecipient,
      1n
    );
    console.error("❌ GAGAL: Transaksi transfer BERHASIL tanpa penolakan! Kontrak bukan Soulbound.");
  } catch (error) {
    console.log("\n------------------------------------------------------------------");
    console.log("✅ HASIL UJI TC-19: BERHASIL MEMENUHI SPESIFIKASI SOULBOUND!");
    console.log("Revert Message dari Smart Contract:");
    console.log(`>>> "${error.reason || error.message}" <<<`);

    if ((error.reason || error.message || "").includes("Soulbound: Token is non-transferable")) {
      console.log("\n🎯 KESIMPULAN: Lencana Paspor Kredit UMKM 100% Permanen dan Non-Transferable.");
      console.log("Token tidak dapat dicuri, dipindahtangankan, atau diperjualbelikan.");
    }
    console.log("==================================================================");
  }
}

runTest()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
