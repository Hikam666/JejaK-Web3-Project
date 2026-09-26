// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title CreditPassportAnchor (Hybrid Model - ERC-721 & EIP-5192)
 * @dev Protokol Reputasi Kredit UMKM JejaK di BNB Smart Chain (BSC).
 *      Mengimplementasikan Dual-Layer Token Architecture:
 *      1. Master Soulbound Credit Passport (SBT): 1 per UMKM, menyimpan reputasi & skor kumulatif.
 *      2. Batch Settlement Receipt NFTs: Dicetak setiap kali UMKM melakukan Tutup Buku (Batch #1, #2, dst.).
 *      Keduanya mengadopsi standar ERC-721 dan EIP-5192 (Minimal Soulbound Tokens - Non-Transferable).
 */
contract CreditPassportAnchor is ERC721URIStorage, Ownable {
    using Strings for uint256;

    address public relayerAdmin;

    // --- EIP-5192 Events ---
    event Locked(uint256 tokenId);

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

    // URI Metadata & Gateway Gambar Visual NFT
    string public baseMetadataURI = "";
    string public imageGatewayURI = "https://jejak.app/api/nft/image/";

    modifier onlyRelayer() {
        require(msg.sender == relayerAdmin || msg.sender == owner(), "Caller is not relayer admin");
        _;
    }

    constructor() ERC721("JejaK Credit Reputation Protocol", "JEJAK") Ownable(msg.sender) {
        relayerAdmin = msg.sender;
    }

    function setRelayerAdmin(address newAdmin) external onlyOwner {
        require(newAdmin != address(0), "Invalid new admin");
        relayerAdmin = newAdmin;
    }

    function setMetadataURIs(string memory _baseMetadataURI, string memory _imageGatewayURI) external onlyRelayer {
        baseMetadataURI = _baseMetadataURI;
        imageGatewayURI = _imageGatewayURI;
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

            _mint(merchant, masterTokenId);
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

        _merchantBatchTokens[merchant].push(batchTokenId);

        batchReceipts[batchTokenId] = BatchReceipt({
            merchant: merchant,
            batchIndex: currentBatchCount,
            totalRevenue: totalRevenue,
            txCount: txCount,
            dataHash: dataHash,
            timestamp: block.timestamp
        });

        _mint(merchant, batchTokenId);
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
        _requireOwned(batchTokenId);
        require(tokenTypes[batchTokenId] == TokenType.BATCH_RECEIPT, "Not a batch receipt token");
        BatchReceipt memory b = batchReceipts[batchTokenId];
        return (b.merchant, b.batchIndex, b.totalRevenue, b.txCount, b.dataHash, b.timestamp);
    }

    function verifyAnchor(address merchant, bytes32 dataHash) external view returns (bool) {
        return _anchorExists[merchant][dataHash];
    }

    // --- EIP-5192 Soulbound Interface ---

    function locked(uint256 tokenId) external view returns (bool) {
        _requireOwned(tokenId);
        return true; // Keduanya non-transferable (soulbound)
    }

    // --- EIP-5192 & ERC-721 Interface Support ---

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721URIStorage)
        returns (bool)
    {
        return
            interfaceId == 0xb45a3c0e || // ERC-5192 Minimal Soulbound
            super.supportsInterface(interfaceId);
    }

    // --- Soulbound Enforcement (Blocks Transfers, Allows Mint/Burn) ---

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("Soulbound: Token is non-transferable");
        }
        return super._update(to, tokenId, auth);
    }

    // --- ERC-721 Metadata URI ---

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override(ERC721URIStorage)
        returns (string memory)
    {
        _requireOwned(tokenId);

        string memory customUri = super.tokenURI(tokenId);
        if (bytes(customUri).length > 0) {
            return customUri;
        }

        if (bytes(baseMetadataURI).length > 0) {
            return string.concat(baseMetadataURI, tokenId.toString());
        }

        TokenType tType = tokenTypes[tokenId];
        string memory imgUrl = string.concat(imageGatewayURI, tokenId.toString());

        if (tType == TokenType.MASTER_SBT) {
            MasterReputation memory b = masterBadges[tokenId];
            string memory tierStr = b.tier == 3 ? "Gold" : (b.tier == 2 ? "Silver" : "Bronze");
            return string.concat(
                'data:application/json;utf8,{"name":"JejaK Master Credit Passport #',
                tokenId.toString(),
                '","description":"Non-transferable Soulbound Credit Passport on BNB Chain","image":"',
                imgUrl,
                '","attributes":[{"trait_type":"Tier","value":"',
                tierStr,
                '"},{"trait_type":"Credit Score","value":',
                b.creditScore.toString(),
                '},{"trait_type":"Total Revenue","value":',
                b.totalRevenue.toString(),
                '},{"trait_type":"Total Batches","value":',
                b.totalBatches.toString(),
                '},{"trait_type":"Soulbound Status","value":"Locked"}]}'
            );
        } else {
            BatchReceipt memory r = batchReceipts[tokenId];
            return string.concat(
                'data:application/json;utf8,{"name":"JejaK Settlement Receipt Batch #',
                r.batchIndex.toString(),
                '","description":"Proof-of-Close settlement anchor on BNB Chain","image":"',
                imgUrl,
                '","attributes":[{"trait_type":"Batch Index","value":',
                r.batchIndex.toString(),
                '},{"trait_type":"Total Revenue","value":',
                r.totalRevenue.toString(),
                '},{"trait_type":"Transaction Count","value":',
                r.txCount.toString(),
                '},{"trait_type":"Type","value":"Settlement Receipt"}]}'
            );
        }
    }
}
