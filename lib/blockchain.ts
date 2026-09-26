import { ethers } from "ethers";

const CONTRACT_ABI = [
  "function relayerAdmin() external view returns (address)",
  "function recordSummary(address merchant, bytes32 dataHash, uint256 totalRevenue, uint256 txCount) external returns (uint256 masterTokenId, uint256 batchTokenId)",
  "function hasMasterSBT(address merchant) external view returns (bool)",
  "function getMasterSBT(address merchant) external view returns (uint256 tokenId, uint8 tier, uint256 creditScore, uint256 totalRevenue, uint256 totalBatches, uint256 issuedAt, uint256 lastUpdated)",
  "function getMerchantBatchTokens(address merchant) external view returns (uint256[])",
  "function getBatchReceiptDetails(uint256 batchTokenId) external view returns (address merchant, uint256 batchIndex, uint256 totalRevenue, uint256 txCount, bytes32 dataHash, uint256 timestamp)",
  "function verifyAnchor(address merchant, bytes32 dataHash) external view returns (bool)",
  "function totalAnchoredBatches() external view returns (uint256)",
  "function totalAnchoredRevenue() external view returns (uint256)",
  "function totalAnchoredTransactions() external view returns (uint256)",
  "function totalMerchantsWithSBT() external view returns (uint256)",
  "function locked(uint256 tokenId) external view returns (bool)",
  "function tokenURI(uint256 tokenId) external view returns (string memory)",
  "function tokenTypes(uint256 tokenId) external view returns (uint8)",
  "function setMetadataURIs(string memory _baseMetadataURI, string memory _imageGatewayURI) external",
  "function baseMetadataURI() external view returns (string memory)",
  "function imageGatewayURI() external view returns (string memory)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event RecordAnchored(address indexed merchant, bytes32 indexed dataHash, uint256 totalRevenue, uint256 txCount, uint256 timestamp)",
  "event MasterSBTMinted(address indexed merchant, uint256 indexed masterTokenId, uint8 tier, uint256 creditScore, uint256 totalRevenue)",
  "event MasterSBTUpdated(address indexed merchant, uint256 indexed masterTokenId, uint8 tier, uint256 creditScore, uint256 totalRevenue, uint256 totalBatches)",
  "event BatchReceiptNFTMinted(address indexed merchant, uint256 indexed batchTokenId, uint256 batchIndex, uint256 totalRevenue, bytes32 dataHash)"
];

const RPC_URL = process.env.BSC_TESTNET_RPC_URL || "https://data-seed-prebsc-1-s1.bnbchain.org:8545";
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x764f397Bf9E54b534F9756ef897744F0B0D3De04";
const RELAYER_PVKEY = process.env.RELAYER_PRIVATE_KEY || "0x0ad6b1f171b00ea16bfd7b8a0767de50f1b13869e9ffc16f12fbb8ff35ca055c";

export function getProvider() {
  const net = ethers.Network.from({ name: "bnbt", chainId: 97 });
  return new ethers.JsonRpcProvider(RPC_URL, net, { staticNetwork: net });
}

export function getRelayerSigner() {
  if (!RELAYER_PVKEY) {
    throw new Error("RELAYER_PRIVATE_KEY is not defined in environment variables");
  }
  const provider = getProvider();
  return new ethers.Wallet(RELAYER_PVKEY, provider);
}

export function getAnchorContract(signerOrProvider?: ethers.Signer | ethers.Provider) {
  const providerOrSigner = signerOrProvider || getProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, providerOrSigner);
}

/**
 * Memeriksa sisa saldo tBNB milik Relayer
 */
export async function getRelayerBalance(): Promise<string> {
  try {
    const signer = getRelayerSigner();
    const provider = getProvider();
    const balanceWei = await provider.getBalance(signer.address);
    return ethers.formatEther(balanceWei);
  } catch (error) {
    console.error("Error fetching relayer balance:", error);
    return "0.0";
  }
}

/**
 * Eksekusi penguncian transaksi on-chain ke BSC Testnet melalui backend relayer
 * Mengimplementasikan Hybrid Model:
 * 1. Meng-update / me-mint Master Soulbound Passport (SBT)
 * 2. Me-minting Batch Settlement Receipt NFT baru (terdeteksi selalu di BscScan)
 */
export async function recordAnchorOnChain(
  merchantAddress: string,
  dataHash: string,
  totalRevenue: number,
  txCount: number
) {
  const signer = getRelayerSigner();
  const contract = getAnchorContract(signer);

  const roundedRevenue = BigInt(Math.round(totalRevenue));
  const txCountBig = BigInt(txCount);

  // Kirim transaksi ke BSC Testnet
  const tx = await contract.recordSummary(merchantAddress, dataHash, roundedRevenue, txCountBig);
  const receipt = await tx.wait();

  // Hitung gas fee
  const gasUsed = receipt.gasUsed;
  const gasPrice = receipt.gasPrice || tx.gasPrice || BigInt(0);
  const gasCostWei = gasUsed * gasPrice;
  const gasFeeBnb = ethers.formatEther(gasCostWei);

  // Parse event logs untuk mendapatkan batchTokenId
  let batchTokenId: string | null = null;
  let masterTokenId: string | null = null;

  try {
    for (const log of receipt.logs) {
      try {
        const parsed = contract.interface.parseLog(log);
        if (parsed && parsed.name === "BatchReceiptNFTMinted") {
          batchTokenId = parsed.args.batchTokenId.toString();
        }
        if (parsed && (parsed.name === "MasterSBTMinted" || parsed.name === "MasterSBTUpdated")) {
          masterTokenId = parsed.args.masterTokenId.toString();
        }
      } catch (_) {}
    }
  } catch (err) {
    console.error("Error parsing logs:", err);
  }

  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    gasUsed: gasUsed.toString(),
    gasFeeBnb,
    batchTokenId,
    masterTokenId,
  };
}

/**
 * Verifikasi langsung ke smart contract BSC apakah hash ini tercatat valid
 */
export async function verifyAnchorOnChain(
  merchantAddress: string,
  dataHash: string
): Promise<boolean> {
  try {
    const contract = getAnchorContract();
    const isValid = await contract.verifyAnchor(merchantAddress, dataHash);
    return Boolean(isValid);
  } catch (error) {
    console.error("Error verifying anchor on chain:", error);
    return false;
  }
}

/**
 * Mengambil status Hybrid Model (Master SBT + Batch Receipt NFTs) dari BSC Testnet
 */
export async function getMerchantSBTFromChain(merchantAddress: string) {
  try {
    const contract = getAnchorContract();
    const hasToken = await contract.hasMasterSBT(merchantAddress);
    if (!hasToken) {
      return null;
    }

    const badge = await contract.getMasterSBT(merchantAddress);
    const tokenId = badge[0].toString();
    const tier = Number(badge[1]); // 1: Bronze, 2: Silver, 3: Gold
    const creditScore = Number(badge[2]);
    const totalRevenue = Number(badge[3]);
    const totalBatches = Number(badge[4]);
    const issuedAt = Number(badge[5]);
    const lastUpdated = Number(badge[6]);

    const tierName = tier === 3 ? "Gold Tier" : (tier === 2 ? "Silver Tier" : "Bronze Tier");

    // Ambil semua Batch Receipt NFTs milik merchant ini
    const batchTokenIds: bigint[] = await contract.getMerchantBatchTokens(merchantAddress).catch(() => []);
    const batchNFTs = await Promise.all(
      batchTokenIds.map(async (bId) => {
        try {
          const det = await contract.getBatchReceiptDetails(bId);
          return {
            tokenId: bId.toString(),
            batchIndex: Number(det[1]),
            totalRevenue: Number(det[2]),
            txCount: Number(det[3]),
            dataHash: det[4],
            timestamp: new Date(Number(det[5]) * 1000).toISOString(),
            bscScanUrl: `https://testnet.bscscan.com/token/${CONTRACT_ADDRESS}?a=${bId.toString()}`,
          };
        } catch {
          return null;
        }
      })
    );

    return {
      hasSBT: true,
      tokenId,
      tier,
      tierName,
      creditScore,
      totalRevenue,
      totalBatches,
      issuedAt: new Date(issuedAt * 1000).toISOString(),
      lastUpdated: new Date(lastUpdated * 1000).toISOString(),
      isSoulboundLocked: true,
      bscScanUrl: `https://testnet.bscscan.com/token/${CONTRACT_ADDRESS}?a=${tokenId}`,
      batchNFTs: batchNFTs.filter(Boolean),
    };
  } catch (error) {
    console.error("Error fetching SBT from chain:", error);
    return null;
  }
}

/**
 * Mengambil total ringkasan ekosistem langsung dari smart contract BSC
 */
export async function getEcosystemStatsOnChain() {
  try {
    const contract = getAnchorContract();
    const [batches, revenue, txs, sbts] = await Promise.all([
      contract.totalAnchoredBatches(),
      contract.totalAnchoredRevenue(),
      contract.totalAnchoredTransactions(),
      contract.totalMerchantsWithSBT().catch(() => 0n),
    ]);

    return {
      totalBatches: Number(batches),
      totalRevenue: Number(revenue),
      totalTransactions: Number(txs),
      totalSBTsMinted: Number(sbts),
    };
  } catch (error) {
    console.error("Error fetching ecosystem stats from chain:", error);
    return {
      totalBatches: 0,
      totalRevenue: 0,
      totalTransactions: 0,
      totalSBTsMinted: 0,
    };
  }
}
