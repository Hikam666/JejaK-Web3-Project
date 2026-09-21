import { NextResponse } from "next/server";
import { AuthController } from "@/controllers/authController";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "login") {
      const { phone, pin } = body;
      const merchant = await AuthController.login(phone, pin);
      return NextResponse.json({
        success: true,
        message: "Login berhasil",
        data: merchant,
      });
    }

    if (action === "register") {
      const merchant = await AuthController.register(body);
      return NextResponse.json({
        success: true,
        message: "Pendaftaran merchant berhasil!",
        data: merchant,
      });
    }

    return NextResponse.json(
      { success: false, error: "Action tidak dikenali (gunakan 'login' atau 'register')" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Terjadi kesalahan otentikasi" },
      { status: 400 }
    );
  }
}
