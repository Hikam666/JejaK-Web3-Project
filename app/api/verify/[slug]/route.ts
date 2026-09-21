import { NextResponse } from "next/server";
import { VerifyController } from "@/controllers/verifyController";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const auditData = await VerifyController.getMerchantAuditData(slug);

    return NextResponse.json({
      success: true,
      data: auditData,
    });
  } catch (error: any) {
    console.error("Error in verify route:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memverifikasi paspor kredit" },
      { status: error.message?.includes("tidak ditemukan") ? 404 : 500 }
    );
  }
}
