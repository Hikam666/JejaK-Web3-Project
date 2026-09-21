import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { message: "Seeding is disabled in production environment." },
    { status: 403 }
  );
}
