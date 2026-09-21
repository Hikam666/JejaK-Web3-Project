// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CreditPassportAnchor (Hybrid Model)
 * @dev Protokol Reputasi Kredit UMKM NSA-Passport di BNB Smart Chain (BSC).
 *      Mengimplementasikan Dual-Layer Token Architecture:
 *      1. Master Soulbound Credit Passport (SBT): 1 per UMKM, menyimpan reputasi & skor kumulatif.
 *      2. Batch Settlement Receipt NFTs: Dicetak setiap kali UMKM melakukan Tutup Buku (Batch #1, #2, dst.).
 *      Keduanya mengadopsi standar ERC-5192 (Minimal Soulbound Tokens - Non-Transferable).
 */
contract CreditPassportAnchor {
    string public constant name = "JejaK Credit Reputation Protocol";
    string public constant symbol = "JEJAK";

    address public relayerAdmin;

    // --- EIP-5192 & ERC-721 Events ---
    event Locked(uint256 tokenId);
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    // --- NSA Protocol Events ---
    event RecordAnchored(
        address indexed merchant,
        bytes32 indexed dataHash,
        uint256 totalRevenue,
        uint256 txCount,
        uint256 timestamp
    );

    event MasterSBTMinted(
        address indexed merchant,
        uint256 indexed masterTokenId,
        uint8 tier,
        uint256 creditScore,
        uint256 totalRevenue
    );

    event MasterSBTUpdated(
        address indexed merchant,
        uint256 indexed masterTokenId,
        uint8 tier,
        uint256 creditScore,
        uint256 totalRevenue,
        uint256 totalBatches
    );

    event BatchReceiptNFTMinted(
        address indexed merchant,
        uint256 indexed batchTokenId,
        uint256 batchIndex,
        uint256 totalRevenue,
        bytes32 dataHash
    );

    // --- Tipe Token ---
    enum TokenType { MASTER_SBT, BATCH_RECEIPT }

    // --- Layer 1: Data Master SBT ---
    struct MasterReputation {
        uint8 tier;             // 1: Bronze, 2: Silver, 3: Gold
        uint256 creditScore;    // 70 - 98
        uint256 totalRevenue;   // Akumulasi total omzet (Rp)
        uint256 totalBatches;   // Jumlah batch tutup buku
        uint256 issuedAt;       // Waktu registrasi / batch perdana
        uint256 lastUpdated;    // Waktu update terakhir
    }

    // --- Layer 2: Data Batch Settlement Receipt NFT ---
    struct BatchReceipt {
        address merchant;
        uint256 batchIndex;     // Batch #1, Batch #2, dst. untuk toko tersebut
        uint256 totalRevenue;   // Omzet pada batch ini
        uint256 txCount;        // Jumlah nota kasir
        bytes32 dataHash;       // Keccak256 hash invoice
        uint256 timestamp;      // Timestamp blok
    }

    // --- State Storage ---
    uint256 private _tokenCounter; // Counter Token ID unik (1, 2, 3...)

    // tokenId => TokenType
    mapping(uint256 => TokenType) public tokenTypes;
    // tokenId => owner address
    mapping(uint256 => address) private _owners;
    // owner => balance
    mapping(address => uint256) private _balances;

    // merchant => Master SBT Token ID
    mapping(address => uint256) private _merchantMasterToken;
    // masterTokenId => MasterReputation
    mapping(uint256 => MasterReputation) public masterBadges;

    // batchTokenId => BatchReceipt
    mapping(uint256 => BatchReceipt) public batchReceipts;
    // merchant => list of batchTokenIds
    mapping(address => uint256[]) private _merchantBatchTokens;

    // merchant => mapping(dataHash => bool)
    mapping(address => mapping(bytes32 => bool)) private _anchorExists;

    // Metrik Global Ekosistem
    uint256 public totalAnchoredBatches;
    uint256 public totalAnchoredRevenue;
    uint256 public totalAnchoredTransactions;
    uint256 public totalMerchantsWithSBT;

    modifier onlyRelayer() {
        require(msg.sender == relayerAdmin, "Caller is not relayer admin");
        _;
    }

    constructor() {
        relayerAdmin = msg.sender;
    }

    function setRelayerAdmin(address newAdmin) external onlyRelayer {
        require(newAdmin != address(0), "Invalid new admin");
        relayerAdmin = newAdmin;
    }

    /**
     * @dev Eksekusi Tutup Buku oleh Relayer:
     *      1. Mencatat anchor hash & omzet ke blockchain
     *      2. Me-minting atau meng-update Layer 1: Master Soulbound Passport (SBT)
     *      3. Me-minting Layer 2: Batch Settlement Receipt NFT baru (selalu muncul di BscScan!)
     */
    function recordSummary(
        address merchant,
        bytes32 dataHash,
        uint256 totalRevenue,
        uint256 txCount
    ) external onlyRelayer returns (uint256 masterTokenId, uint256 batchTokenId) {
        require(merchant != address(0), "Invalid merchant address");
        require(dataHash != bytes32(0), "Invalid data hash");

        _anchorExists[merchant][dataHash] = true;
        totalAnchoredBatches += 1;
        totalAnchoredRevenue += totalRevenue;
        totalAnchoredTransactions += txCount;

        emit RecordAnchored(merchant, dataHash, totalRevenue, txCount, block.timestamp);

        // --- LAYER 1: MASTER REPUTATION SOULBOUND PASSPORT (SBT) ---
        masterTokenId = _merchantMasterToken[merchant];
        uint256 currentBatchCount = _merchantBatchTokens[merchant].length + 1;

        if (masterTokenId == 0) {
            // First time: Mint Master SBT
            _tokenCounter += 1;
            masterTokenId = _tokenCounter;
            _merchantMasterToken[merchant] = masterTokenId;
            tokenTypes[masterTokenId] = TokenType.MASTER_SBT;

            _owners[masterTokenId] = merchant;
            _balances[merchant] += 1;
            totalMerchantsWithSBT += 1;

            uint8 initialTier = totalRevenue >= 10000000 ? 3 : (totalRevenue >= 1000000 ? 2 : 1);
            uint256 initialScore = 75;

            masterBadges[masterTokenId] = MasterReputation({
                tier: initialTier,
                creditScore: initialScore,
                totalRevenue: totalRevenue,
                totalBatches: 1,
                issuedAt: block.timestamp,
                lastUpdated: block.timestamp
            });

            emit Transfer(address(0), merchant, masterTokenId);
            emit Locked(masterTokenId);
            emit MasterSBTMinted(merchant, masterTokenId, initialTier, initialScore, totalRevenue);
        } else {
            // Subsequent batches: Update Master SBT
            MasterReputation storage rep = masterBadges[masterTokenId];
            rep.totalRevenue += totalRevenue;
            rep.totalBatches += 1;
            rep.lastUpdated = block.timestamp;

            // Naikkan tier jika memenuhi syarat
            if (rep.totalRevenue >= 10000000 || rep.totalBatches >= 5) {
                rep.tier = 3; // Gold
            } else if (rep.totalRevenue >= 1000000 || rep.totalBatches >= 2) {
                rep.tier = 2; // Silver
            }

            // Naikkan skor kredit bertahap (maksimal 98)
            uint256 newScore = 70 + (rep.totalBatches * 5);
            if (newScore > 98) newScore = 98;
            rep.creditScore = newScore;

            emit MasterSBTUpdated(merchant, masterTokenId, rep.tier, newScore, rep.totalRevenue, rep.totalBatches);
        }

        // --- LAYER 2: BATCH SETTLEMENT RECEIPT NFT (SELALU MINT BARU DI SETIAP TUTUP BUKU) ---
        _tokenCounter += 1;
        batchTokenId = _tokenCounter;
        tokenTypes[batchTokenId] = TokenType.BATCH_RECEIPT;

        _owners[batchTokenId] = merchant;
        _balances[merchant] += 1;
        _merchantBatchTokens[merchant].push(batchTokenId);

        batchReceipts[batchTokenId] = BatchReceipt({
            merchant: merchant,
            batchIndex: currentBatchCount,
            totalRevenue: totalRevenue,
            txCount: txCount,
            dataHash: dataHash,
            timestamp: block.timestamp
        });

        // Pancarkan event ERC-721 dan EIP-5192 (muncul langsung di BscScan Token Txns!)
        emit Transfer(address(0), merchant, batchTokenId);
        emit Locked(batchTokenId);
        emit BatchReceiptNFTMinted(merchant, batchTokenId, currentBatchCount, totalRevenue, dataHash);

        return (masterTokenId, batchTokenId);
    }

    // --- Query Functions: Master SBT ---

    function hasMasterSBT(address merchant) external view returns (bool) {
        return _merchantMasterToken[merchant] != 0;
    }

    function getMasterSBT(address merchant) external view returns (
        uint256 tokenId,
        uint8 tier,
        uint256 creditScore,
        uint256 totalRevenue,
        uint256 totalBatches,
        uint256 issuedAt,
        uint256 lastUpdated
    ) {
        tokenId = _merchantMasterToken[merchant];
        require(tokenId != 0, "Merchant has no Master SBT yet");
        MasterReputation memory b = masterBadges[tokenId];
        return (tokenId, b.tier, b.creditScore, b.totalRevenue, b.totalBatches, b.issuedAt, b.lastUpdated);
    }

    // --- Query Functions: Batch Receipt NFTs ---

    function getMerchantBatchTokens(address merchant) external view returns (uint256[] memory) {
        return _merchantBatchTokens[merchant];
    }

    function getBatchReceiptDetails(uint256 batchTokenId) external view returns (
        address merchant,
        uint256 batchIndex,
        uint256 totalRevenue,
        uint256 txCount,
        bytes32 dataHash,
        uint256 timestamp
    ) {
        require(_owners[batchTokenId] != address(0), "Token does not exist");
        require(tokenTypes[batchTokenId] == TokenType.BATCH_RECEIPT, "Not a batch receipt token");
        BatchReceipt memory b = batchReceipts[batchTokenId];
        return (b.merchant, b.batchIndex, b.totalRevenue, b.txCount, b.dataHash, b.timestamp);
    }

    function verifyAnchor(address merchant, bytes32 dataHash) external view returns (bool) {
        return _anchorExists[merchant][dataHash];
    }

    // --- EIP-5192 Soulbound Interface ---

    function locked(uint256 tokenId) external view returns (bool) {
        require(_owners[tokenId] != address(0), "Token does not exist");
        return true; // Keduanya non-transferable (soulbound)
    }

    // --- ERC-721 Interface Functions ---

    function balanceOf(address owner) external view returns (uint256) {
        require(owner != address(0), "Zero address");
        return _balances[owner];
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        address owner = _owners[tokenId];
        require(owner != address(0), "Token does not exist");
        return owner;
    }

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return
            interfaceId == 0x01ffc9a7 || // ERC-165
            interfaceId == 0x80ac58cd || // ERC-721
            interfaceId == 0x5b5e139f || // ERC-721 Metadata
            interfaceId == 0xb45a3c0e;   // ERC-5192 Minimal Soulbound
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(_owners[tokenId] != address(0), "Token does not exist");
        TokenType tType = tokenTypes[tokenId];

        if (tType == TokenType.MASTER_SBT) {
            MasterReputation memory b = masterBadges[tokenId];
            string memory tierStr = b.tier == 3 ? "Gold" : (b.tier == 2 ? "Silver" : "Bronze");
            return string(
                abi.encodePacked(
                    'data:application/json;utf8,{"name":"NSA Master Credit Passport #',
                    _toString(tokenId),
                    '","description":"Non-transferable Soulbound Credit Passport on BNB Chain","tier":"',
                    tierStr,
                    '","creditScore":',
                    _toString(b.creditScore),
                    ',"totalRevenue":',
                    _toString(b.totalRevenue),
                    '}'
                )
            );
        } else {
            BatchReceipt memory r = batchReceipts[tokenId];
            return string(
                abi.encodePacked(
                    'data:application/json;utf8,{"name":"NSA Settlement Receipt Batch #',
                    _toString(r.batchIndex),
                    '","description":"Proof-of-Close settlement anchor on BNB Chain","batchIndex":',
                    _toString(r.batchIndex),
                    ',"totalRevenue":',
                    _toString(r.totalRevenue),
                    '}'
                )
            );
        }
    }

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
