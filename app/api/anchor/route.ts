import { NextResponse } from "next/server";
import { AnchorController } from "@/controllers/anchorController";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { merchantId } = body;

    const result = await AnchorController.anchorPendingTransactions(merchantId);

    return NextResponse.json({
      success: true,
      message: "Transaksi berhasil dikunci secara kriptografis ke BNB Smart Chain!",
      data: result,
    });
  } catch (error: any) {
    console.error("Error anchoring transactions:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengunci transaksi ke blockchain" },
      { status: 500 }
    );
  }
}
