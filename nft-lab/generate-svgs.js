const fs = require('fs');
const path = require('path');

function generateMasterSbtSvg(data = {}) {
  const {
    umkmId = "JK-UMKM-2026-0812",
    businessName = "Warung Kopi Barokah",
    ownerWallet = "0xc804...4746",
    category = "Food & Beverage (Kuliner)",
    region = "Surabaya, Jawa Timur",
    reputationScore = "785 / 850",
    tierName = "Tier Gold (Sangat Layak)",
    monthlyRunRate = "Rp 18.500.000",
  } = data;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 1050" width="700" height="1050" style="background:#f4f4f6; font-family: 'Cinzel', 'Playfair Display', Georgia, serif;">
  <defs>
    <!-- Soft Drop Shadows -->
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="125%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#0b1329" flood-opacity="0.14" />
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#0b1329" flood-opacity="0.08" />
    </filter>
    <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#070d1e" flood-opacity="0.32" />
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.15" />
    </filter>
    <filter id="embossBevel" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="1" dy="2" stdDeviation="1" flood-color="#ffffff" flood-opacity="0.8" />
      <feDropShadow dx="-1" dy="-1" stdDeviation="1" flood-color="#000000" flood-opacity="0.3" />
    </filter>

    <!-- Metallic Gold Gradients -->
    <linearGradient id="goldSheen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FBF2B7" />
      <stop offset="25%" stop-color="#E2B857" />
      <stop offset="50%" stop-color="#B8861E" />
      <stop offset="75%" stop-color="#F5DB8B" />
      <stop offset="100%" stop-color="#9E6E17" />
    </linearGradient>

    <linearGradient id="goldBevelLight" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#AA7A1E" />
      <stop offset="35%" stop-color="#FCEBB6" />
      <stop offset="70%" stop-color="#DFB349" />
      <stop offset="100%" stop-color="#8C5C0D" />
    </linearGradient>

    <!-- Royal Navy Batik Band Gradient -->
    <linearGradient id="royalNavyBatik" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0A162B" />
      <stop offset="50%" stop-color="#0F244A" />
      <stop offset="100%" stop-color="#07101E" />
    </linearGradient>

    <!-- Subtle Ceramic Background -->
    <linearGradient id="porcelainBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="45%" stop-color="#FBFBFC" />
      <stop offset="100%" stop-color="#F3F5F8" />
    </linearGradient>

    <!-- Batik Pattern Definition (Kawung / Floral Petals in Gold) -->
    <pattern id="batikFloral" width="50" height="50" patternUnits="userSpaceOnUse">
      <g opacity="0.35">
        <circle cx="25" cy="25" r="8" fill="none" stroke="url(#goldSheen)" stroke-width="0.75" />
        <ellipse cx="25" cy="12" rx="6" ry="11" fill="none" stroke="url(#goldSheen)" stroke-width="0.8" />
        <ellipse cx="25" cy="38" rx="6" ry="11" fill="none" stroke="url(#goldSheen)" stroke-width="0.8" />
        <ellipse cx="12" cy="25" rx="11" ry="6" fill="none" stroke="url(#goldSheen)" stroke-width="0.8" />
        <ellipse cx="38" cy="25" rx="11" ry="6" fill="none" stroke="url(#goldSheen)" stroke-width="0.8" />
        <polygon points="25,21 28,25 25,29 22,25" fill="url(#goldSheen)" opacity="0.85" />
      </g>
    </pattern>
  </defs>

  <!-- OUTER CONTAINER CARD -->
  <g transform="translate(30, 25)">
    <!-- Main Card Body -->
    <rect x="0" y="0" width="640" height="1000" rx="36" fill="url(#porcelainBg)" filter="url(#cardShadow)" />
    <!-- Fine Border -->
    <rect x="0" y="0" width="640" height="1000" rx="36" fill="none" stroke="#E6E9EF" stroke-width="1.5" />

    <!-- WATERMARK: LEFT BOTANICAL LEAF LINEAGE -->
    <g opacity="0.22" transform="translate(10, 220)">
      <path d="M 40 400 C 60 300, 30 180, 110 90 C 130 150, 100 240, 70 330 Z" fill="none" stroke="#64748B" stroke-width="1.2" />
      <path d="M 60 310 C 90 280, 140 270, 160 300 C 130 330, 80 340, 60 310 Z" fill="#94A3B8" opacity="0.4" />
      <path d="M 45 250 C 20 200, 25 150, 60 140 C 70 180, 60 220, 45 250 Z" fill="#94A3B8" opacity="0.35" />
      <path d="M 80 200 C 110 160, 150 150, 170 180 C 140 210, 100 220, 80 200 Z" fill="#94A3B8" opacity="0.4" />
      <path d="M 95 130 C 80 90, 100 50, 140 50 C 150 90, 130 120, 95 130 Z" fill="#94A3B8" opacity="0.35" />
    </g>

    <!-- GOLDEN SWIRL HAIRLINES (Graceful luxury curves) -->
    <path d="M 230 40 C 270 90, 280 180, 330 220" fill="none" stroke="url(#goldSheen)" stroke-width="0.8" opacity="0.7" />
    <path d="M 370 650 C 440 700, 420 850, 480 920" fill="none" stroke="url(#goldSheen)" stroke-width="0.8" opacity="0.7" />

    <!-- VERTICAL ROYAL NAVY BATIK RIBBON STRIP -->
    <g transform="translate(250, 0)">
      <!-- Navy Band Base -->
      <rect x="0" y="0" width="140" height="1000" fill="url(#royalNavyBatik)" />
      <!-- Batik Pattern Overlay -->
      <rect x="0" y="0" width="140" height="1000" fill="url(#batikFloral)" />
      <!-- Golden Border Flanks -->
      <line x1="0" y1="0" x2="0" y2="1000" stroke="url(#goldSheen)" stroke-width="1.5" />
      <line x1="140" y1="0" x2="140" y2="1000" stroke="url(#goldSheen)" stroke-width="1.5" />

      <!-- Golden Rosettes on Ribbon (Top and Bottom) -->
      <g transform="translate(70, 75) scale(0.9)">
        <polygon points="0,-18 5,-5 18,0 5,5 0,18 -5,5 -18,0 -5,-5" fill="url(#goldSheen)" />
        <circle cx="0" cy="0" r="4" fill="#0A162B" />
      </g>
      <g transform="translate(70, 920) scale(0.9)">
        <polygon points="0,-18 5,-5 18,0 5,5 0,18 -5,5 -18,0 -5,-5" fill="url(#goldSheen)" />
        <circle cx="0" cy="0" r="4" fill="#0A162B" />
      </g>
    </g>

    <!-- ==================== TOP SECTION ==================== -->
    <!-- TOP LEFT: TITLE & IDENTITY -->
    <g transform="translate(48, 70)">
      <text x="0" y="42" font-size="44" font-weight="900" letter-spacing="1" fill="#0B1528" font-family="'Cinzel', Georgia, serif">UMKM</text>
      <text x="0" y="90" font-size="44" font-weight="900" letter-spacing="1" fill="#0B1528" font-family="'Cinzel', Georgia, serif">SBT</text>
      
      <text x="0" y="124" font-size="10" font-weight="700" letter-spacing="2.8" fill="#1E3A8A" font-family="'Inter', -apple-system, sans-serif">INDONESIAN MSME</text>
      <text x="0" y="139" font-size="10" font-weight="700" letter-spacing="2.8" fill="#1E3A8A" font-family="'Inter', -apple-system, sans-serif">IDENTITY TOKEN</text>

      <line x1="0" y1="156" x2="28" y2="156" stroke="url(#goldSheen)" stroke-width="2.5" stroke-linecap="round" />

      <text x="0" y="178" font-size="9" font-weight="800" letter-spacing="2.2" fill="#64748B" font-family="'Inter', sans-serif">LOKAL</text>
      <text x="0" y="193" font-size="9" font-weight="800" letter-spacing="2.2" fill="#64748B" font-family="'Inter', sans-serif">BERDAYA</text>
      <text x="0" y="208" font-size="9" font-weight="800" letter-spacing="2.2" fill="#64748B" font-family="'Inter', sans-serif">BERDAMPAK</text>
    </g>

    <!-- TOP RIGHT: INDONESIA MAP & MOTTO -->
    <g transform="translate(590, 70)" text-anchor="end">
      <text x="0" y="16" font-size="9.5" font-weight="800" letter-spacing="2.4" fill="#0F172A" font-family="'Inter', sans-serif">SMALL</text>
      <text x="0" y="30" font-size="9.5" font-weight="800" letter-spacing="2.4" fill="#0F172A" font-family="'Inter', sans-serif">BUSINESS</text>
      <text x="0" y="44" font-size="9.5" font-weight="800" letter-spacing="2.4" fill="#0F172A" font-family="'Inter', sans-serif">BIGGER</text>
      <text x="0" y="58" font-size="9.5" font-weight="800" letter-spacing="2.4" fill="#1E3A8A" font-family="'Inter', sans-serif">INDONESIA</text>
      <line x1="-24" y1="70" x2="0" y2="70" stroke="url(#goldSheen)" stroke-width="2" />

      <!-- Minimal Indonesia Map Silhouette -->
      <g transform="translate(-160, 92) scale(0.28)" opacity="0.35">
        <path d="M 18 93 C 34 112, 48 130, 78 169 C 107 207, 127 222, 142 194 C 151 190, 149 184, 142 174 C 114 161, 102 140, 86 130 C 58 111, 37 95, 18 93 Z M 257 106 C 249 121, 238 138, 213 140 C 177 153, 190 184, 213 195 C 241 200, 262 198, 276 158 C 289 141, 281 131, 274 107 Z M 357 140 C 320 141, 302 158, 296 173 C 290 190, 298 211, 308 217 C 320 201, 331 194, 333 170 C 343 167, 360 145, 357 140 Z M 443 161 C 434 166, 436 173, 441 176 C 455 182, 464 183, 453 199 C 468 201, 483 207, 513 221 C 546 186, 538 183, 506 174 C 474 187, 462 164, 443 161 Z" fill="#334155" />
      </g>
    </g>

    <!-- ==================== CENTERPIECE GOLD HEXAGON EMBLEM ==================== -->
    <g transform="translate(320, 395)" filter="url(#badgeShadow)">
      <!-- Outer Beveled Gold Hexagon -->
      <!-- Hexagon points: radius 140 -->
      <polygon points="0,-140 121,-70 121,70 0,140 -121,70 -121,-70" fill="url(#goldBevelLight)" />
      
      <!-- Inner Stepped Border -->
      <polygon points="0,-132 114,-66 114,66 0,132 -114,66 -114,-66" fill="url(#goldSheen)" />

      <!-- Deep Dark Plaque Center -->
      <polygon points="0,-122 105,-61 105,61 0,122 -105,61 -105,-61" fill="#071224" />

      <!-- Delicate Inner Gold Hairline Inside Plaque -->
      <polygon points="0,-115 99,-57 99,57 0,115 -99,57 -99,-57" fill="none" stroke="url(#goldSheen)" stroke-width="1.2" opacity="0.6" />

      <!-- Gold Floral Petals Top (Above Shopfront) -->
      <g transform="translate(0, -78) scale(0.65)">
        <polygon points="0,-14 4,-4 14,0 4,4 0,14 -4,4 -14,0 -4,-4" fill="url(#goldSheen)" />
        <circle cx="0" cy="0" r="3" fill="#071224" />
      </g>

      <!-- EMBOSSED GOLD WARUNG / SHOPFRONT ICON -->
      <g transform="translate(0, 0)" filter="url(#embossBevel)">
        <!-- Roof Awning -->
        <path d="M -56 -24 L 56 -24 L 64 -6 C 64 2, 54 8, 48 8 C 42 8, 38 4, 32 8 C 26 12, 20 8, 16 8 C 12 8, 6 12, 0 8 C -6 12, -12 8, -16 8 C -20 8, -26 12, -32 8 C -38 4, -42 8, -48 8 C -54 8, -64 2, -64 -6 Z" fill="url(#goldSheen)" />
        
        <!-- Awning Roof Stripes Lines -->
        <line x1="-48" y1="-22" x2="-48" y2="4" stroke="#8C5C0D" stroke-width="1.2" />
        <line x1="-32" y1="-22" x2="-32" y2="4" stroke="#8C5C0D" stroke-width="1.2" />
        <line x1="-16" y1="-22" x2="-16" y2="4" stroke="#8C5C0D" stroke-width="1.2" />
        <line x1="0" y1="-22" x2="0" y2="4" stroke="#8C5C0D" stroke-width="1.2" />
        <line x1="16" y1="-22" x2="16" y2="4" stroke="#8C5C0D" stroke-width="1.2" />
        <line x1="32" y1="-22" x2="32" y2="4" stroke="#8C5C0D" stroke-width="1.2" />
        <line x1="48" y1="-22" x2="48" y2="4" stroke="#8C5C0D" stroke-width="1.2" />

        <!-- Store Front Structure & Counter -->
        <!-- Pillars -->
        <rect x="-50" y="8" width="6" height="52" fill="url(#goldSheen)" />
        <rect x="44" y="8" width="6" height="52" fill="url(#goldSheen)" />

        <!-- Counter & Shelves Left -->
        <rect x="-44" y="28" width="46" height="4" fill="url(#goldSheen)" />
        <rect x="-44" y="44" width="46" height="16" fill="url(#goldSheen)" />
        <!-- Jars on shelf -->
        <rect x="-40" y="16" width="9" height="12" rx="2" fill="url(#goldSheen)" />
        <rect x="-28" y="16" width="9" height="12" rx="2" fill="url(#goldSheen)" />
        <rect x="-16" y="16" width="9" height="12" rx="2" fill="url(#goldSheen)" />

        <!-- Bar Stool Right -->
        <ellipse cx="26" cy="34" rx="10" ry="3" fill="url(#goldSheen)" />
        <line x1="20" y1="35" x2="16" y2="60" stroke="url(#goldSheen)" stroke-width="3" stroke-linecap="round" />
        <line x1="32" y1="35" x2="36" y2="60" stroke="url(#goldSheen)" stroke-width="3" stroke-linecap="round" />
        <line x1="18" y1="48" x2="34" y2="48" stroke="url(#goldSheen)" stroke-width="2" />

        <!-- Base Foundation Line -->
        <rect x="-56" y="60" width="112" height="4" rx="1.5" fill="url(#goldSheen)" />

        <!-- Sprout Leaf of Prosperity (Right side) -->
        <path d="M 52 48 C 58 40, 72 38, 74 24 C 64 26, 54 36, 52 48 Z" fill="url(#goldSheen)" />
      </g>

      <!-- Badge Motto Bottom -->
      <text x="0" y="88" font-size="8.5" font-weight="800" letter-spacing="2.2" fill="url(#goldSheen)" text-anchor="middle" font-family="'Inter', sans-serif">DARI LOKAL</text>
      <text x="0" y="100" font-size="8.5" font-weight="800" letter-spacing="2.2" fill="url(#goldSheen)" text-anchor="middle" font-family="'Inter', sans-serif">UNTUK DUNIA</text>
      <line x1="-14" y1="108" x2="14" y2="108" stroke="url(#goldSheen)" stroke-width="1.5" />
    </g>

    <!-- MIDDLE RIGHT: SOULBOUND LOCK BADGE -->
    <g transform="translate(540, 525)" text-anchor="middle">
      <!-- Circular Lock Container -->
      <circle cx="0" cy="0" r="24" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" filter="url(#embossBevel)" />
      <!-- Lock Icon SVG inside -->
      <g transform="translate(-8, -10) scale(0.7)">
        <rect x="3" y="11" width="18" height="11" rx="2" fill="#0B132B" />
        <path d="M 7 11 V 7 C 7 4.2 9.2 2 12 2 C 14.8 2 17 4.2 17 7 V 11" fill="none" stroke="#0B132B" stroke-width="2.5" stroke-linecap="round" />
        <circle cx="12" cy="16" r="1.5" fill="#FFFFFF" />
      </g>
      <text x="0" y="44" font-size="11.5" font-weight="800" fill="#0F172A" font-family="'Inter', sans-serif">Non-Transferable</text>
      <text x="0" y="58" font-size="8.5" font-weight="800" letter-spacing="1.5" fill="#64748B" font-family="'Inter', sans-serif">SOULBOUND</text>
      <text x="0" y="69" font-size="8.5" font-weight="800" letter-spacing="1.5" fill="#64748B" font-family="'Inter', sans-serif">TOKEN</text>
    </g>

    <!-- ==================== BOTTOM SECTION: DATA BUBBLE CARD ==================== -->
    <g transform="translate(48, 620)">
      <!-- Bubble Card Container -->
      <rect x="0" y="0" width="544" height="230" rx="22" fill="#FFFFFF" stroke="#E6D3A3" stroke-width="1.2" filter="url(#cardShadow)" />

      <!-- Inner Rows (5 Pill Containers) -->
      <!-- Row 1: UMKM ID -->
      <g transform="translate(18, 16)">
        <text x="12" y="22" font-size="10.5" font-weight="800" letter-spacing="1.5" fill="#1E293B" font-family="'Inter', sans-serif">UMKM ID</text>
        <text x="175" y="22" font-size="11" font-weight="700" fill="#64748B">:</text>
        <rect x="195" y="4" width="315" height="28" rx="8" fill="#F1F5F9" />
        <text x="210" y="23" font-size="11" font-weight="800" fill="#0F172A" font-family="'JetBrains Mono', monospace">${umkmId}</text>
      </g>

      <!-- Row 2: OWNER WALLET -->
      <g transform="translate(18, 56)">
        <text x="12" y="22" font-size="10.5" font-weight="800" letter-spacing="1.5" fill="#1E293B" font-family="'Inter', sans-serif">OWNER WALLET</text>
        <text x="175" y="22" font-size="11" font-weight="700" fill="#64748B">:</text>
        <rect x="195" y="4" width="315" height="28" rx="8" fill="#F1F5F9" />
        <text x="210" y="23" font-size="11" font-weight="800" fill="#1E3A8A" font-family="'JetBrains Mono', monospace">${ownerWallet}</text>
      </g>

      <!-- Row 3: CATEGORY -->
      <g transform="translate(18, 96)">
        <text x="12" y="22" font-size="10.5" font-weight="800" letter-spacing="1.5" fill="#1E293B" font-family="'Inter', sans-serif">CATEGORY</text>
        <text x="175" y="22" font-size="11" font-weight="700" fill="#64748B">:</text>
        <rect x="195" y="4" width="315" height="28" rx="8" fill="#F1F5F9" />
        <text x="210" y="23" font-size="11" font-weight="700" fill="#0F172A" font-family="'Inter', sans-serif">${category}</text>
      </g>

      <!-- Row 4: REGION -->
      <g transform="translate(18, 136)">
        <text x="12" y="22" font-size="10.5" font-weight="800" letter-spacing="1.5" fill="#1E293B" font-family="'Inter', sans-serif">REGION</text>
        <text x="175" y="22" font-size="11" font-weight="700" fill="#64748B">:</text>
        <rect x="195" y="4" width="315" height="28" rx="8" fill="#F1F5F9" />
        <text x="210" y="23" font-size="11" font-weight="700" fill="#0F172A" font-family="'Inter', sans-serif">${region}</text>
      </g>

      <!-- Row 5: REPUTATION SCORE -->
      <g transform="translate(18, 176)">
        <text x="12" y="22" font-size="10.5" font-weight="800" letter-spacing="1.5" fill="#1E293B" font-family="'Inter', sans-serif">REPUTATION SCORE</text>
        <text x="175" y="22" font-size="11" font-weight="700" fill="#64748B">:</text>
        <rect x="195" y="4" width="315" height="28" rx="8" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="1" />
        <text x="210" y="23" font-size="12" font-weight="900" fill="#1D4ED8" font-family="'JetBrains Mono', monospace">${reputationScore} &bull; ${tierName}</text>
      </g>
    </g>

    <!-- ==================== FOOTER SECTION ==================== -->
    <!-- Bottom Left -->
    <g transform="translate(48, 890)">
      <text x="0" y="14" font-size="10" font-weight="800" letter-spacing="1.6" fill="#1E293B" font-family="'Inter', sans-serif">INDONESIA</text>
      <text x="0" y="28" font-size="10" font-weight="800" letter-spacing="1.6" fill="#1E293B" font-family="'Inter', sans-serif">LEBIH MAJU</text>
      <text x="0" y="42" font-size="10" font-weight="800" letter-spacing="1.6" fill="#1E3A8A" font-family="'Inter', sans-serif">BERSAMA UMKM</text>
      <line x1="0" y1="52" x2="24" y2="52" stroke="url(#goldSheen)" stroke-width="2" />
    </g>

    <!-- Bottom Right -->
    <g transform="translate(590, 890)" text-anchor="end">
      <text x="0" y="14" font-size="10" font-weight="800" letter-spacing="1.6" fill="#1E293B" font-family="'Inter', sans-serif">REAL</text>
      <text x="0" y="28" font-size="10" font-weight="800" letter-spacing="1.6" fill="#1E293B" font-family="'Inter', sans-serif">BUSINESS</text>
      <text x="0" y="42" font-size="10" font-weight="800" letter-spacing="1.6" fill="#1E293B" font-family="'Inter', sans-serif">REAL</text>
      <text x="0" y="56" font-size="10" font-weight="800" letter-spacing="1.6" fill="#1E3A8A" font-family="'Inter', sans-serif">IMPACT</text>
      <line x1="-24" y1="66" x2="0" y2="66" stroke="url(#goldSheen)" stroke-width="2" />
    </g>
  </g>
</svg>`;
}

function generateBatchReceiptSvg(data = {}) {
  const {
    batchNumber = "008",
    businessName = "Warung Kopi Barokah",
    settlementDate = "21 Sep 2026, 21:45 WIB",
    totalRevenue = "Rp 1.450.000",
    txCount = "18 Transaksi Kasir",
    paymentBreakdown = "QRIS (82%) • Tunai (18%)",
    proofRatio = "100% Bukti Nota Terlampir",
    dataHash = "0x508619bba5499daf25db4e1228fd7da6d600182d4ef16bce93f93de3ce325d52",
    bscTxHash = "0x4e6e51120cd06702636beba7fa90e586852dd741ab7d6c4c62c0f25685994b01",
    blockNumber = "Block #4289104",
  } = data;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 1050" width="700" height="1050" style="background:#f4f4f6; font-family: 'Cinzel', 'Playfair Display', Georgia, serif;">
  <defs>
    <!-- Shadows -->
    <filter id="ticketShadow" x="-10%" y="-10%" width="120%" height="125%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#0b1329" flood-opacity="0.14" />
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#0b1329" flood-opacity="0.08" />
    </filter>

    <linearGradient id="goldSheenTicket" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FBF2B7" />
      <stop offset="30%" stop-color="#E2B857" />
      <stop offset="60%" stop-color="#B8861E" />
      <stop offset="100%" stop-color="#9E6E17" />
    </linearGradient>

    <linearGradient id="ticketBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="60%" stop-color="#FCFCFD" />
      <stop offset="100%" stop-color="#F4F6F9" />
    </linearGradient>

    <!-- Perforation Pattern -->
    <mask id="ticketCutoutMask">
      <rect x="0" y="0" width="640" height="1000" rx="36" fill="#FFFFFF" />
      <!-- Left Notch Cutout -->
      <circle cx="0" cy="460" r="18" fill="#000000" />
      <!-- Right Notch Cutout -->
      <circle cx="640" cy="460" r="18" fill="#000000" />
    </mask>

    <pattern id="batikHeader" width="40" height="40" patternUnits="userSpaceOnUse">
      <g opacity="0.25">
        <circle cx="20" cy="20" r="6" fill="none" stroke="url(#goldSheenTicket)" stroke-width="0.75" />
        <ellipse cx="20" cy="10" rx="5" ry="8" fill="none" stroke="url(#goldSheenTicket)" stroke-width="0.75" />
        <ellipse cx="20" cy="30" rx="5" ry="8" fill="none" stroke="url(#goldSheenTicket)" stroke-width="0.75" />
        <ellipse cx="10" cy="20" rx="8" ry="5" fill="none" stroke="url(#goldSheenTicket)" stroke-width="0.75" />
        <ellipse cx="30" cy="20" rx="8" ry="5" fill="none" stroke="url(#goldSheenTicket)" stroke-width="0.75" />
      </g>
    </pattern>
  </defs>

  <g transform="translate(30, 25)">
    <!-- TICKET SHAPE WITH SIDE NOTCHES -->
    <rect x="0" y="0" width="640" height="1000" rx="36" fill="url(#ticketBg)" mask="url(#ticketCutoutMask)" filter="url(#ticketShadow)" />
    <!-- Fine Border -->
    <rect x="0" y="0" width="640" height="1000" rx="36" fill="none" stroke="#E2E8F0" stroke-width="1.5" mask="url(#ticketCutoutMask)" />

    <!-- TOP HEADER BAND (NAVY + GOLD BATIK) -->
    <rect x="0" y="0" width="640" height="205" rx="36" fill="#0A162B" />
    <rect x="0" y="160" width="640" height="45" fill="#0A162B" /> <!-- square bottom corners of top header -->
    <rect x="0" y="0" width="640" height="205" fill="url(#batikHeader)" />

    <!-- GOLD ACCENT BOTTOM STRIP FOR HEADER -->
    <line x1="0" y1="205" x2="640" y2="205" stroke="url(#goldSheenTicket)" stroke-width="2.5" />

    <!-- TOP HEADER CONTENT (2 Cleanly Separated Rows - Zero Overlap) -->
    <!-- ROW 1: Authentic JejaK Logo + Protocol ID + #BATCH Pill -->
    <g transform="translate(42, 28)">
      <!-- Authentic JejaK Logo Emblem (From Official SVG) -->
      <g transform="translate(0, 0)">
        <!-- Outer Gold Ring -->
        <circle cx="23" cy="23" r="24" fill="#0B0F19" stroke="url(#goldSheenTicket)" stroke-width="1.8" />
        <!-- Inner Official Emblem Scaled to 46px -->
        <g transform="translate(-0.5, -0.5) scale(0.046)">
          <path d="M 478 88.038 C 418.185 93.625, 369.727 107.566, 315.313 134.843 C 295.327 144.862, 280.751 153.929, 259 169.876 C 241.366 182.803, 215.822 205.189, 200.500 221.142 C 182.713 239.662, 171.615 253.189, 156.314 275 C 125.109 319.482, 101.401 375.212, 91.022 428.478 C 84.228 463.350, 82.600 482.779, 83.296 520.730 C 83.856 551.275, 84.947 562.622, 90.022 590.672 C 92.541 604.600, 98.514 628.414, 103.020 642.500 C 112.197 671.189, 130.252 710.111, 146.379 735.971 C 187.679 802.199, 240.670 852.334, 310.212 890.974 C 332.436 903.323, 362.996 916.367, 386 923.322 C 412.069 931.205, 431.413 935.353, 460 939.191 C 474.139 941.089, 481.150 941.409, 509 941.425 C 543.856 941.445, 557.561 940.355, 585 935.383 C 634.070 926.492, 682.614 908.964, 723.039 885.540 C 737.238 877.313, 762.536 860.484, 773.800 851.774 C 801.877 830.062, 832.844 798.530, 854.598 769.500 C 871.193 747.354, 885.350 724.275, 897.534 699.500 C 914.262 665.488, 925.296 633.294, 932.440 597.658 C 939.543 562.229, 941.510 539.661, 940.681 503.123 C 939.926 469.842, 937.355 448.491, 930.373 417.500 C 927.090 402.929, 921.886 385.579, 915.996 369.562 C 909.501 351.899, 905.319 342.340, 895.976 323.797 C 874.131 280.445, 845.757 242.175, 809.656 207.370 C 787.571 186.078, 762.477 166.551, 736.500 150.443 C 722.307 141.642, 691.099 125.828, 674.500 119.025 C 638.978 104.467, 604.081 95.194, 565 89.929 C 552.848 88.292, 542.804 87.766, 518.500 87.495 C 501.450 87.305, 483.225 87.549, 478 88.038" fill="#0B0F19" />
          <path d="M 561.490 199.813 C 541.266 211.968, 492.441 241.590, 447.500 268.969 C 430.373 279.403, 415.426 289.232, 412.668 291.873 C 407.363 296.952, 403.424 303.790, 401.361 311.500 C 400.298 315.477, 400.023 332.875, 400.019 396.500 C 400.017 446.889, 400.399 478.906, 401.052 483 C 401.677 486.920, 403.839 493.116, 406.499 498.611 L 410.909 507.721 447.204 543.085 C 509.157 603.448, 544.861 639.127, 552.837 648.643 C 561.429 658.895, 566.107 666.201, 569.533 674.721 C 572.995 683.332, 575.134 695.442, 574.796 704.530 L 574.500 712.500 573.229 707.102 C 571.281 698.829, 564.986 686.407, 557.976 677 C 551.797 668.710, 540.861 657.318, 479.783 595.552 L 450.066 565.500 450.033 649.370 L 450 733.241 458.427 742.972 C 471.073 757.576, 487.706 774.658, 493.953 779.456 C 500.926 784.812, 506.844 787.880, 514.500 790.110 L 520.500 791.858 512.802 791.929 C 502.482 792.024, 491.237 788.488, 483.339 782.663 C 475.213 776.669, 466.423 766.850, 403.523 693.500 C 389.846 677.550, 373.759 659.004, 367.774 652.286 C 358.722 642.126, 355.852 639.567, 350.697 637.064 C 347.288 635.409, 341.800 633.639, 338.500 633.130 C 331.151 631.997, 226 632.946, 226 634.145 C 226 635.566, 235.165 654.918, 240.850 665.500 C 248.111 679.015, 262.851 701.239, 272.930 713.869 C 283.008 726.497, 300.526 744.189, 312 753.327 C 336.406 772.763, 362.456 786.471, 391.236 795.023 C 396.881 796.700, 408.025 799.254, 416 800.699 C 429.031 803.059, 432.932 803.324, 454.500 803.321 C 474.614 803.319, 480.362 802.976, 490 801.207 C 509.120 797.696, 530.749 790.739, 540.711 784.896 C 548.398 780.387, 559.623 769.197, 565.361 760.324 C 570.546 752.305, 575.094 741.665, 577.738 731.363 C 579.381 724.962, 579.500 714.633, 579.500 578 L 579.500 431.500 576.191 424.511 C 573.386 418.588, 570.493 415.116, 557.231 401.761 C 548.624 393.092, 541.248 386, 540.842 386 C 540.198 386, 503.265 409.511, 469.500 431.414 C 463.450 435.339, 449.745 444.164, 439.045 451.025 C 421.359 462.366, 410.926 470.717, 407.218 476.500 C 406.119 478.214, 405.993 477.563, 406.336 471.956 C 407.117 459.196, 415.219 448.307, 431.775 437.768 C 436.326 434.870, 448.476 427.043, 458.775 420.373 C 469.074 413.703, 487.625 401.748, 500 393.807 C 558.776 356.091, 572.811 347.099, 576.750 344.634 L 581 341.975 581 265.487 C 581 223.419, 580.658 189, 580.240 189 C 579.823 189, 571.385 193.866, 561.490 199.813 M 582.230 369.525 L 582.500 391.279 602 399.701 C 620.573 407.722, 727.717 453.631, 738.733 458.288 L 743.966 460.500 743.970 517.500 C 743.973 569.279, 743.803 575.324, 742.106 583.500 C 739.705 595.073, 735.162 606.750, 729.211 616.642 C 722.877 627.170, 718.357 632.982, 709.188 642.385 C 699.662 652.156, 688.537 661.518, 675.500 670.737 C 664.933 678.208, 631.215 699.891, 612.147 711.477 C 605.902 715.271, 600.605 718.865, 600.376 719.463 C 600.146 720.062, 600.080 729.868, 600.229 741.255 L 600.500 761.958 625 747.184 C 653.810 729.810, 667.444 721.179, 686.432 708.294 C 738.649 672.860, 765.831 638.274, 776.653 593.500 C 778.147 587.315, 778.387 577.593, 778.715 510 L 779.086 433.500 767.293 428.368 C 760.807 425.545, 734.125 413.908, 708 402.509 C 645.941 375.428, 587.128 349.870, 583.230 348.287 C 582.222 347.877, 582.016 352.254, 582.230 369.525 M 662.769 492.308 C 661.818 496.264, 659.237 503.154, 657.035 507.621 C 654.042 513.692, 651.440 517.226, 646.725 521.621 C 639.489 528.368, 633.433 531.852, 623.500 534.982 C 611.853 538.652, 611.990 538.466, 619.582 540.308 C 623.387 541.232, 630.166 543.789, 634.648 545.991 C 644.061 550.618, 650.635 557.085, 655.830 566.832 C 659.443 573.612, 664 586.185, 664 589.375 C 664 592.913, 665.610 589.782, 667.505 582.559 C 672.007 565.398, 682.083 552.402, 696.121 545.650 C 700.313 543.634, 706.763 541.239, 710.454 540.328 C 717.352 538.626, 717.468 537.821, 711 536.532 C 709.075 536.148, 703.340 533.837, 698.255 531.397 C 686.396 525.706, 679.047 518.668, 673.273 507.476 C 670.997 503.063, 668.353 496.538, 667.398 492.976 C 666.443 489.414, 665.400 486.189, 665.081 485.808 C 664.761 485.428, 663.721 488.353, 662.769 492.308" fill="#FFFFFF" fill-rule="evenodd" />
        </g>
      </g>

      <!-- Protocol Title Beside Logo -->
      <g transform="translate(60, 10)">
        <text x="0" y="16" font-size="13" font-weight="900" letter-spacing="2.2" fill="#FFFFFF" font-family="'Cinzel', Georgia, serif">JEJAK PROTOCOL</text>
        <text x="0" y="30" font-size="8.5" font-weight="700" letter-spacing="1.5" fill="#93C5FD" font-family="'Inter', sans-serif">BNB SMART CHAIN SBT &bull; AUTONOMOUS RELAYER</text>
      </g>

      <!-- #BATCH Pill Badge Top-Right (Positioned independently with zero overlap) -->
      <g transform="translate(556, 8)" text-anchor="end">
        <rect x="-124" y="0" width="124" height="34" rx="17" fill="url(#goldSheenTicket)" />
        <text x="-62" y="22" font-size="12.5" font-weight="900" letter-spacing="1.5" fill="#0A162B" text-anchor="middle" font-family="'JetBrains Mono', monospace">#BATCH-${batchNumber}</text>
      </g>
    </g>

    <!-- ROW 2: Main Headline & Subtitle (Completely Separate Row Below) -->
    <g transform="translate(42, 118)">
      <text x="0" y="26" font-size="26" font-weight="900" letter-spacing="1.2" fill="#FFFFFF" font-family="'Cinzel', Georgia, serif">JEJAK SETTLEMENT RECEIPT</text>
      <text x="0" y="48" font-size="9.5" font-weight="800" letter-spacing="2.4" fill="#FDE68A" font-family="'Inter', sans-serif">PROOF-OF-CLOSE BATCH ANCHOR &bull; CRYPTOGRAPHIC CLEARING</text>
      <line x1="0" y1="58" x2="160" y2="58" stroke="url(#goldSheenTicket)" stroke-width="2" />
    </g>

    <!-- ==================== MERCHANT SUMMARY HEADER ==================== -->
    <g transform="translate(42, 235)">
      <text x="0" y="18" font-size="11" font-weight="800" letter-spacing="2" fill="#64748B" font-family="'Inter', sans-serif">NAMA USAHA TERDAFTAR</text>
      <text x="0" y="50" font-size="28" font-weight="900" fill="#0F172A" font-family="'Cinzel', Georgia, serif">${businessName}</text>
      
      <g transform="translate(0, 70)">
        <text x="0" y="16" font-size="11.5" font-weight="700" fill="#475569" font-family="'Inter', sans-serif">Waktu Penguncian Kasir :</text>
        <text x="175" y="16" font-size="11.5" font-weight="800" fill="#1E3A8A" font-family="'JetBrains Mono', monospace">${settlementDate}</text>
      </g>
    </g>

    <!-- ==================== PERFORATION LINE WITH NOTCHES ==================== -->
    <g transform="translate(0, 360)">
      <!-- Perforated dashed line -->
      <line x1="24" y1="0" x2="616" y2="0" stroke="#CBD5E1" stroke-width="1.8" stroke-dasharray="8, 6" />
      <circle cx="320" cy="0" r="4" fill="#94A3B8" />
    </g>

    <!-- ==================== AUDIT METRICS BUBBLE CARD ==================== -->
    <g transform="translate(48, 390)">
      <text x="0" y="20" font-size="11.5" font-weight="900" letter-spacing="1.8" fill="#1E3A8A" font-family="'Inter', sans-serif">RINGKASAN OMZET BATCH TERKUNCI</text>

      <!-- Grid 2-Kolom -->
      <!-- Box 1: Total Omzet -->
      <g transform="translate(0, 36)">
        <rect x="0" y="0" width="260" height="74" rx="16" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.2" />
        <text x="18" y="26" font-size="10" font-weight="800" letter-spacing="1.5" fill="#64748B" font-family="'Inter', sans-serif">TOTAL OMZET BATCH</text>
        <text x="18" y="54" font-size="20" font-weight="900" fill="#0F172A" font-family="'JetBrains Mono', monospace">${totalRevenue}</text>
      </g>

      <!-- Box 2: Jumlah Transaksi -->
      <g transform="translate(284, 36)">
        <rect x="0" y="0" width="260" height="74" rx="16" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.2" />
        <text x="18" y="26" font-size="10" font-weight="800" letter-spacing="1.5" fill="#64748B" font-family="'Inter', sans-serif">JUMLAH TRANSAKSI</text>
        <text x="18" y="54" font-size="20" font-weight="900" fill="#1E3A8A" font-family="'JetBrains Mono', monospace">${txCount}</text>
      </g>

      <!-- Box 3: Porsi Pembayaran -->
      <g transform="translate(0, 122)">
        <rect x="0" y="0" width="260" height="64" rx="16" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.2" />
        <text x="18" y="24" font-size="10" font-weight="800" letter-spacing="1.2" fill="#64748B" font-family="'Inter', sans-serif">METODE TRANSAKSI</text>
        <text x="18" y="47" font-size="12" font-weight="800" fill="#0F172A" font-family="'Inter', sans-serif">${paymentBreakdown}</text>
      </g>

      <!-- Box 4: Rasio Bukti Fisik Nota -->
      <g transform="translate(284, 122)">
        <rect x="0" y="0" width="260" height="64" rx="16" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.2" />
        <text x="18" y="24" font-size="10" font-weight="800" letter-spacing="1.2" fill="#64748B" font-family="'Inter', sans-serif">BUKTI KAPASITAS NOTA</text>
        <text x="18" y="47" font-size="12" font-weight="800" fill="#059669" font-family="'Inter', sans-serif">${proofRatio}</text>
      </g>
    </g>

    <!-- ==================== CRYPTOGRAPHIC PROOF BOX ==================== -->
    <g transform="translate(48, 620)">
      <rect x="0" y="0" width="544" height="180" rx="20" fill="#07101E" stroke="#1E293B" stroke-width="1.5" />
      
      <!-- Top Title inside box -->
      <g transform="translate(20, 24)">
        <circle cx="8" cy="8" r="6" fill="#10B981" />
        <text x="24" y="12" font-size="10.5" font-weight="900" letter-spacing="2" fill="#E2E8F0" font-family="'Inter', sans-serif">BUKTI KRIPTOGRAFIS ON-CHAIN (ANTI REKAYASA)</text>
      </g>

      <!-- Hash Line 1: Keccak256 -->
      <g transform="translate(20, 58)">
        <text x="0" y="12" font-size="9" font-weight="800" letter-spacing="1.5" fill="#94A3B8" font-family="'Inter', sans-serif">DATA INTEGRITY HASH (KECCAK-256):</text>
        <text x="0" y="30" font-size="10.5" font-weight="700" fill="#38BDF8" font-family="'JetBrains Mono', monospace">${dataHash.slice(0, 42)}...</text>
      </g>

      <!-- Hash Line 2: BSC Tx Hash -->
      <g transform="translate(20, 110)">
        <text x="0" y="12" font-size="9" font-weight="800" letter-spacing="1.5" fill="#94A3B8" font-family="'Inter', sans-serif">BSC TRANSACTION HASH:</text>
        <text x="0" y="30" font-size="10.5" font-weight="700" fill="#FBBF24" font-family="'JetBrains Mono', monospace">${bscTxHash.slice(0, 42)}...</text>
      </g>

      <g transform="translate(20, 156)">
        <text x="0" y="10" font-size="9" font-weight="700" fill="#64748B" font-family="'Inter', sans-serif">Status Gas Fee Kasir: </text>
        <text x="135" y="10" font-size="9" font-weight="800" fill="#34D399" font-family="'Inter', sans-serif">Rp 0 (Sponsored by Relayer) &bull; ${blockNumber}</text>
      </g>
    </g>

    <!-- ==================== BOTTOM VERIFICATION & QR CODE ==================== -->
    <g transform="translate(48, 830)">
      <!-- Simulated Vector QR Code -->
      <g transform="translate(0, 10)">
        <rect x="0" y="0" width="90" height="90" rx="12" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.2" />
        <!-- QR Patterns -->
        <rect x="10" y="10" width="24" height="24" fill="#0F172A" />
        <rect x="14" y="14" width="16" height="16" fill="#FFFFFF" />
        <rect x="18" y="18" width="8" height="8" fill="#0F172A" />

        <rect x="56" y="10" width="24" height="24" fill="#0F172A" />
        <rect x="60" y="14" width="16" height="16" fill="#FFFFFF" />
        <rect x="64" y="18" width="8" height="8" fill="#0F172A" />

        <rect x="10" y="56" width="24" height="24" fill="#0F172A" />
        <rect x="14" y="60" width="16" height="16" fill="#FFFFFF" />
        <rect x="18" y="64" width="8" height="8" fill="#0F172A" />

        <!-- Pixel Dots -->
        <rect x="42" y="14" width="6" height="6" fill="#0F172A" />
        <rect x="42" y="28" width="6" height="6" fill="#0F172A" />
        <rect x="42" y="42" width="6" height="6" fill="#0F172A" />
        <rect x="56" y="42" width="6" height="6" fill="#0F172A" />
        <rect x="70" y="42" width="6" height="6" fill="#0F172A" />
        <rect x="42" y="56" width="6" height="6" fill="#0F172A" />
        <rect x="56" y="70" width="12" height="6" fill="#0F172A" />
        <rect x="74" y="60" width="6" height="16" fill="#0F172A" />
      </g>

      <!-- Text beside QR -->
      <g transform="translate(108, 20)">
        <rect x="0" y="0" width="195" height="26" rx="13" fill="#ECFDF5" stroke="#A7F3D0" stroke-width="1" />
        <circle cx="14" cy="13" r="4" fill="#10B981" />
        <text x="26" y="17" font-size="9.5" font-weight="900" letter-spacing="1.2" fill="#047857" font-family="'Inter', sans-serif">TERVERIFIKASI ON-CHAIN</text>

        <text x="0" y="48" font-size="10" font-weight="700" fill="#475569" font-family="'Inter', sans-serif">Pindai kode QR untuk membuka berkas</text>
        <text x="0" y="64" font-size="10" font-weight="700" fill="#475569" font-family="'Inter', sans-serif">audit transaksi di BscScan &amp; Terminal JejaK</text>
      </g>

      <!-- Stamp Circle Seal Bottom Right -->
      <g transform="translate(480, 55)" opacity="0.85">
        <circle cx="0" cy="0" r="42" fill="none" stroke="url(#goldSheenTicket)" stroke-width="2" stroke-dasharray="4, 2" />
        <circle cx="0" cy="0" r="36" fill="none" stroke="url(#goldSheenTicket)" stroke-width="1.2" />
        <text x="0" y="-12" font-size="7" font-weight="900" letter-spacing="1.5" fill="#8C5C0D" text-anchor="middle" font-family="'Inter', sans-serif">BNB CHAIN</text>
        <text x="0" y="2" font-size="9.5" font-weight="900" letter-spacing="1.2" fill="#0F172A" text-anchor="middle" font-family="'Cinzel', serif">LOCKED</text>
        <text x="0" y="16" font-size="7" font-weight="900" letter-spacing="1.5" fill="#8C5C0D" text-anchor="middle" font-family="'Inter', sans-serif">SETTLEMENT</text>
      </g>
    </g>

    <!-- FOOTER SIGNATURE -->
    <g transform="translate(48, 960)">
      <line x1="0" y1="0" x2="544" y2="0" stroke="#E2E8F0" stroke-width="1" />
      <text x="0" y="22" font-size="9" font-weight="800" letter-spacing="1.5" fill="#94A3B8" font-family="'Inter', sans-serif">JEJAK PROTOKOL REPUTASI KREDIT UMKM</text>
      <text x="544" y="22" font-size="9" font-weight="800" letter-spacing="1.5" fill="#94A3B8" text-anchor="end" font-family="'Inter', sans-serif">AUTONOMOUS SETTLEMENT RECEIPT</text>
    </g>
  </g>
</svg>`;
}

// Isomorphic export: works in Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateMasterSbtSvg,
    generateBatchReceiptSvg,
  };
  
  if (typeof fs !== 'undefined' && fs.writeFileSync && typeof __dirname !== 'undefined') {
    const labDir = path.join(__dirname, '../nft-lab');
    fs.writeFileSync(path.join(labDir, 'master-sbt.svg'), generateMasterSbtSvg());
    fs.writeFileSync(path.join(labDir, 'batch-receipt.svg'), generateBatchReceiptSvg());
    console.log('✅ Generated master-sbt.svg and batch-receipt.svg in nft-lab/');
  }
}

if (typeof window !== 'undefined') {
  window.generateMasterSbtSvg = generateMasterSbtSvg;
  window.generateBatchReceiptSvg = generateBatchReceiptSvg;
}
