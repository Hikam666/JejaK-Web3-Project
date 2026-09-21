import { NextResponse } from "next/server";
import { VerifyController } from "@/controllers/verifyController";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const merchants = await VerifyController.listRegisteredMerchants();
    return NextResponse.json({
      success: true,
      data: merchants,
    });
  } catch (error: any) {
    console.error("Error fetching merchant list for verify:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memuat direktori toko" },
      { status: 500 }
    );
  }
}
