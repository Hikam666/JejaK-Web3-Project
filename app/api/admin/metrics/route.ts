import { NextResponse } from "next/server";
import { AdminController } from "@/controllers/adminController";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const data = await AdminController.getPlatformDashboard();
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memuat metrik admin" },
      { status: 500 }
    );
  }
}
