import { NextResponse } from "next/server";
import { AdminController } from "@/controllers/adminController";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const result = AdminController.verifyAdminLogin(password);

    return NextResponse.json({
      success: true,
      message: "Otentikasi operator berhasil",
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Akses ditolak" },
      { status: 401 }
    );
  }
}
