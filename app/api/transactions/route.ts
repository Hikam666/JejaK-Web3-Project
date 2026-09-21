import { NextResponse } from "next/server";
import { TransactionController } from "@/controllers/transactionController";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const merchantId = searchParams.get("merchantId");
    const status = searchParams.get("status") || undefined;

    if (!merchantId) {
      return NextResponse.json(
        { success: false, error: "merchantId diperlukan" },
        { status: 400 }
      );
    }

    const { transactions, pending } = await TransactionController.getTransactionsByMerchant(
      merchantId,
      status
    );

    return NextResponse.json({
      success: true,
      data: transactions,
      pending,
    });
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
    const newTx = await TransactionController.recordTransaction(body);

    return NextResponse.json({
      success: true,
      data: newTx,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mencatat transaksi" },
      { status: 400 }
    );
  }
}
