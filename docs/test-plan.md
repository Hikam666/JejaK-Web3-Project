# 📋 Pre-Deployment Test Plan: JejaK (Web3 MSME Credit Passport)

Dokumen ini memuat rencana pengujian (*test plan*) komprehensif end-to-end sebelum sistem JejaK dideploy ke lingkungan production (Mainnet / Demo Pitching Hackathon).

---

## 🎯 Ringkasan Arsitektur yang Diuji
1. **Frontend & PWA**: Next.js 14 App Router (Kasir POS, Paspor Kredit, Portal Verifier Bank).
2. **Database**: Supabase PostgreSQL dengan Prisma ORM (Session, Merchants, Invoices, Batch Anchors).
3. **Gasless Relayer**: Backend Node.js / Ethers.js v6 dengan akun relayer yang membiayai gas fee BNB.
4. **Smart Contract**: `CreditPassportAnchor.sol` (OpenZeppelin ERC-721 + EIP-5192 Soulbound di BNB Smart Chain).

---

## 🧪 Matriks Skenario Pengujian

### Modul 1: Onboarding & Autentikasi UMKM (Merchant)
| ID | Skenario Pengujian | Langkah Pengujian | Ekspektasi Hasil |
| :--- | :--- | :--- | :--- |
| **TC-01** | Pendaftaran Toko Baru (Register) | Buka `/merchant/login` -> tab Register -> Isi nama pemilik, nama toko, No. WA, PIN 6 digit, kota -> Submit. | 1. Akun tersimpan di Supabase.<br>2. EVM Wallet toko ter-generate otomatis.<br>3. Slug unik dibuat (cth: `kedai-kopi-nusantara`).<br>4. Redirect ke dashboard kasir `/merchant`. |
| **TC-02** | Login Toko Terdaftar | Logout -> Masukkan No. WA & PIN yang benar -> Submit. | Login sukses, sesi tersimpan di `localStorage`, diarahkan ke kasir toko tersebut. |
| **TC-03** | Validasi PIN Salah / Nomor Tidak Ada | Masukkan PIN salah (cth: `999999`) atau nomor belum terdaftar. | Muncul notifikasi error humanis, tidak crash, tombol tidak stuck loading. |
| **TC-04** | Proteksi Route Kasir | Akses langsung `/merchant` tanpa login di Incognito browser. | Otomatis di-redirect kembali ke `/merchant/login`. |

---

### Modul 2: Operasional Kasir Cepat (POS Engine)
| ID | Skenario Pengujian | Langkah Pengujian | Ekspektasi Hasil |
| :--- | :--- | :--- | :--- |
| **TC-05** | Tambah Item Menu Kustom | Di tab Kasir -> Klik `+ Tambah Menu` -> Masukkan nama item & harga -> Simpan. | Item baru muncul di grid menu toko dan tersimpan di memori katalog kasir. |
| **TC-06** | Hapus Item Menu | Klik ikon kelola menu -> Klik hapus pada salah satu item. | Item terhapus dari grid katalog menu toko. |
| **TC-07** | Pencatatan Transaksi Menu Keranjang | Klik beberapa menu item -> Sesuaikan quantity (+ / -) -> Pilih metode bayar (QRIS/Tunai) -> Catat Transaksi. | Transaksi tersimpan dengan status `PENDING_ANCHOR`, masuk ke ringkasan "Belum Dikunci". |
| **TC-08** | Pencatatan Transaksi Manual & Lampiran Foto | Masukkan nominal langsung di keypad (cth: Rp 50.000) -> Upload/ambil foto struk pembayaran -> Catat Transaksi. | Transaksi tercatat dengan `proofImageUrl` (Base64 foto nota), status `PENDING_ANCHOR`. |
| **TC-09** | Keranjang Kosong / Validasi Nominal Nol | Tekan "Catat Transaksi" saat keranjang kosong dan nominal manual Rp 0. | Tombol disable atau muncul peringatan nominal wajib diisi > 0. |

---

### Modul 3: Settlement Tutup Buku & Gasless Relayer BSC
| ID | Skenario Pengujian | Langkah Pengujian | Ekspektasi Hasil |
| :--- | :--- | :--- | :--- |
| **TC-10** | Tutup Buku Perdana (Batch #1) | Di tab Tutup Buku -> Pastikan ada transaksi pending -> Klik **"Tutup Buku & Kunci ke BSC"**. | 1. Hash Keccak256 dihitung.<br>2. Relayer mengirim tx gasless ke BSC Testnet.<br>3. Master SBT (#1) & Batch Receipt (#2) dicetak.<br>4. Transaksi berubah status menjadi `ANCHORED`. |
| **TC-11** | Tutup Buku Lanjutan (Batch #2) | Buat 2 transaksi kasir baru -> Lakukan Tutup Buku lagi. | 1. Master SBT ter-update akumulasi omzet & batch-nya.<br>2. Batch Receipt NFT baru (#3) dicetak.<br>3. Skor kredit bertambah bertahap. |
| **TC-12** | Validasi Zero Pending | Klik "Tutup Buku" saat transaksi pending bernilai 0. | Tombol disable atau sistem menampilkan pesan "Tidak ada transaksi baru untuk dikunci". |
| **TC-13** | Ketahanan Saldo Relayer | Relayer mengeksekusi transaksi. | Saldo tBNB relayer terpotong hanya sebesar gas fee BSC (~0.0004 tBNB), saldo tersisa masih mencukupi (>0.15 tBNB). |

---

### Modul 4: Paspor Kredit Digital & Validasi Visual NFT
| ID | Skenario Pengujian | Langkah Pengujian | Ekspektasi Hasil |
| :--- | :--- | :--- | :--- |
| **TC-14** | Sinkronisasi Halaman Paspor Kasir | Buka `/merchant/passport`. | 1. Total omzet terkunci sama persis dengan kalkulasi batch.<br>2. Tier lencana (Bronze/Silver/Gold) sesuai threshold.<br>3. Riwayat Batch terdaftar (`#BATCH-001`, `#BATCH-002`). |
| **TC-15** | Preview & Unduh SVG Master SBT | Di `/merchant/passport` -> Lihat kartu SBT visual -> Klik "Unduh Paspor (SVG)". | File SVG beresolusi tinggi terunduh dengan detail nama toko, skor kredit, dan alamat dompet toko. |
| **TC-16** | Preview & Unduh Struk Batch NFT | Klik "Lihat NFT Struk" pada salah satu batch di tabel riwayat -> Klik "Unduh Struk NFT (SVG)". | Modal menampilkan visual Batch Receipt dengan logo BNB, rincian omzet, data hash, dan tombol download SVG berfungsi. |
| **TC-17** | Validasi di BscScan Explorer | Buka link transaksi atau contract address di `testnet.bscscan.com`. | 1. Di tab **ERC-721 Token Txns** tercatat pencetakan token ke alamat toko.<br>2. Token Tracker menampilkan `JejaK Credit Reputation Protocol (JEJAK)`. |
| **TC-18** | Validasi Standar TokenURI | Akses `/api/nft/metadata/1` dan `/api/nft/image/1` via browser. | 1. Metadata mengembalikan schema JSON valid ERC-721.<br>2. Image endpoint mengembalikan format `image/svg+xml`. |
| **TC-19** | Uji Proteksi Soulbound (Non-Transferable) | Coba panggil `transferFrom` atau transfer token via wallet dari merchant ke wallet lain. | Transaksi on-chain otomatis gagal (*revert*) dengan pesan `"Soulbound: Token is non-transferable"`. |

---

### Modul 5: Portal Verifikasi Lender / Analis Bank (`/verify/[slug]`)
| ID | Skenario Pengujian | Langkah Pengujian | Ekspektasi Hasil |
| :--- | :--- | :--- | :--- |
| **TC-20** | Akses Portal Verifikasi Publik | Buka link bagikan: `http://localhost:3000/verify/<slug-toko>`. | Halaman terbuka tanpa perlu login, menampilkan kartu paspor terverifikasi, metrik underwriting, dan audit trail. |
| **TC-21** | Akurasi Underwriting Metrik Bank | Cek panel rekomendasi kredit analis bank. | 1. **Monthly Run-Rate**: Akumulasi omzet 30 hari.<br>2. **Kapasitas Cicilan**: 20% margin laba x 50%.<br>3. **Rekomendasi Plafon**: 50% dari omzet bulanan.<br>4. **Proof Ratio**: Persentase transaksi dengan bukti nota. |
| **TC-22** | Audit Kriptografis Live (Hitung Ulang Hash) | Buka salah satu batch -> Masuk tab "Audit Kriptografis" -> Klik **"Hitung Ulang Hash Keccak256"**. | Sistem menghitung ulang hash invoice secara live di browser dan menampilkan status hijau: *"Hash Identik 100% Cocok dengan On-Chain"*. |
| **TC-23** | Inspeksi Bukti Nota Fisik | Di dalam modal audit batch -> Klik ikon foto kamera pada salah satu transaksi nota. | Modal foto nota kasir/struk belanja terbuka dengan jelas untuk kebutuhan cross-check lapangan analis bank. |

---

### Modul 6: Ketahanan Sistem & Environment Production
| ID | Skenario Pengujian | Langkah Pengujian | Ekspektasi Hasil |
| :--- | :--- | :--- | :--- |
| **TC-24** | Responsiveness & Tampilan Mobile | Buka browser DevTools mode Mobile (iPhone 14 / Pixel 7 - lebar 375-430px). | Layout kasir bergaya mobile app, tombol keypad mudah ditekan dengan satu tangan (*one-hand POS*), drawer keranjang collapsible. |
| **TC-25** | RPC Failover & Timeout Resilience | Lakukan settlement dengan beban jaringan. | Koneksi ke official node BNB Chain (`data-seed-prebsc-1-s1`) merespons di bawah 1.5 detik. |
| **TC-26** | SSL & Pooling Supabase | Cek koneksi prisma dan load traffic simultan. | Koneksi PostgreSQL pooler berjalan lancar tanpa error `prepared statement already exists` atau handshake timeout. |

---

## 🚀 Checklist Singkat Go-Live
- [ ] Database dalam kondisi bersih (*fresh initial state*).
- [ ] Kontrak aktif di `.env`: `0x764f397Bf9E54b534F9756ef897744F0B0D3De04`.
- [ ] Saldo relayer wallet `0xc804...4746` terisi tBNB yang cukup (>0.1 tBNB).
- [ ] `npm run build` sukses tanpa lint/type error.
- [ ] Demo run-through: Registrasi 1 toko -> 3 Transaksi kasir -> 1 Kali Tutup Buku -> Verifikasi paspor bank.
