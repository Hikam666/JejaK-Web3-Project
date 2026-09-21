import { prisma } from "@/lib/db";
import { ethers } from "ethers";

export interface CreateMerchantInput {
  businessName: string;
  businessCategory: string;
  city: string;
  phone: string;
  ownerName: string;
  pin?: string;
  photoUrl?: string;
  qrisStaticUrl?: string;
}

export class MerchantModel {
  static async findBySlug(slug: string) {
    return prisma.merchant.findUnique({
      where: { slug },
      include: {
        anchors: {
          orderBy: { periodDate: "desc" },
          take: 10,
        },
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });
  }

  static async findById(id: string) {
    return prisma.merchant.findUnique({
      where: { id },
    });
  }

  static async findByPhone(phone: string) {
    return prisma.merchant.findFirst({
      where: { phone },
    });
  }

  static async findByAddress(merchantAddress: string) {
    return prisma.merchant.findUnique({
      where: { merchantAddress },
    });
  }

  static async listAll() {
    return prisma.merchant.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            transactions: true,
            anchors: true,
          },
        },
      },
    });
  }

  static async count() {
    return prisma.merchant.count();
  }

  static async create(input: CreateMerchantInput) {
    // Generate an EVM wallet for the merchant automatically
    const wallet = ethers.Wallet.createRandom();
    
    // Auto-generate unique slug
    let baseSlug = input.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.merchant.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return prisma.merchant.create({
      data: {
        slug,
        businessName: input.businessName,
        businessCategory: input.businessCategory,
        city: input.city,
        phone: input.phone,
        ownerName: input.ownerName,
        pin: input.pin || "123456",
        photoUrl: input.photoUrl,
        qrisStaticUrl: input.qrisStaticUrl,
        merchantAddress: wallet.address,
        encryptedPrivateKey: wallet.privateKey,
      },
    });
  }
}
