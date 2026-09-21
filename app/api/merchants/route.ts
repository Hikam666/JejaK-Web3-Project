import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { MerchantModel } from "@/models/MerchantModel";
import { getMerchantSBTFromChain } from "@/lib/blockchain";
import { calculateCreditMetrics } from "@/lib/creditMetrics";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const id = searchParams.get("id");

    if (slug) {
      const merchant = await MerchantModel.findBySlug(slug);
      if (!merchant) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
      const sbt = await getMerchantSBTFromChain(merchant.merchantAddress);
      const creditMetrics = calculateCreditMetrics(merchant);
      const { encryptedPrivateKey, pin, ...safeMerchant } = merchant;
      return NextResponse.json({ success: true, data: { ...safeMerchant, sbt, creditMetrics } });
    }

    if (id) {
      const merchant = await MerchantModel.findById(id);
      if (!merchant) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
      const sbt = await getMerchantSBTFromChain(merchant.merchantAddress);
      const creditMetrics = calculateCreditMetrics(merchant);
      const { encryptedPrivateKey, pin, ...safeMerchant } = merchant;
      return NextResponse.json({ success: true, data: { ...safeMerchant, sbt, creditMetrics } });
    }

    const merchants = await prisma.merchant.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { transactions: true, anchors: true },
        },
        anchors: {
          select: { totalRevenue: true, transactionCount: true },
        },
      },
    });

    const safeList = merchants.map((m) => {
      const totalRevenue = m.anchors.reduce((acc, a) => acc + a.totalRevenue, 0);
      const { encryptedPrivateKey, pin, ...safe } = m;
      return {
        ...safe,
        totalRevenue,
      };
    });

    return NextResponse.json({ success: true, data: safeList });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newMerchant = await MerchantModel.create(body);
    const { encryptedPrivateKey, pin, ...safe } = newMerchant;

    return NextResponse.json({
      success: true,
      data: safe,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal membuat merchant" },
      { status: 400 }
    );
  }
}
