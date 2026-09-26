import { MerchantModel, CreateMerchantInput } from "@/models/MerchantModel";

export class AuthController {
  static async login(phone: string, pin: string) {
    if (!phone || !pin) {
      throw new Error("Nomor WhatsApp/HP dan PIN wajib diisi");
    }

    const merchant = await MerchantModel.findByPhone(phone.trim());
    if (!merchant) {
      throw new Error("Nomor HP belum terdaftar. Silakan lakukan pendaftaran terlebih dahulu.");
    }

    if (merchant.pin !== pin.trim()) {
      throw new Error("PIN kasir yang Anda masukkan salah.");
    }

    // Never return private key to client
    const { encryptedPrivateKey, ...safeMerchant } = merchant;
    return safeMerchant;
  }

  static async register(input: CreateMerchantInput) {
    if (!input.businessName || !input.ownerName || !input.phone || !input.pin) {
      throw new Error("Nama usaha, nama pemilik, nomor HP, dan PIN wajib diisi");
    }

    const existing = await MerchantModel.findByPhone(input.phone.trim());
    if (existing) {
      throw new Error("Nomor HP sudah terdaftar. Silakan langsung login.");
    }

    const merchant = await MerchantModel.create({
      businessName: input.businessName.trim(),
      businessCategory: input.businessCategory || "Kuliner / Makanan",
      city: input.city || "Jakarta",
      phone: input.phone.trim(),
      ownerName: input.ownerName.trim(),
      pin: input.pin.trim(),
      photoUrl: input.photoUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
      qrisStaticUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020101021126580016ID.CO.QRIS.WWW01189360099900000000015204581253033605802ID5919${encodeURIComponent(input.businessName)}6007Jakarta6304ABCD`,
    });

    const { encryptedPrivateKey, ...safeMerchant } = merchant;
    return safeMerchant;
  }

  static async exportWallet(merchantId: string, pin: string) {
    if (!merchantId || !pin) {
      throw new Error("Merchant ID dan PIN keamanan wajib diisi.");
    }

    const merchant = await MerchantModel.findById(merchantId);
    if (!merchant) {
      throw new Error("Toko tidak ditemukan.");
    }

    if (merchant.pin !== pin.trim()) {
      throw new Error("PIN keamanan kasir salah. Akses kunci privat ditolak.");
    }

    return {
      merchantAddress: merchant.merchantAddress,
      privateKey: merchant.encryptedPrivateKey,
      businessName: merchant.businessName,
      ownerName: merchant.ownerName,
    };
  }
}
