import { ethers } from "ethers";

export interface BatchPayload {
  merchantAddress: string;
  totalRevenue: number;
  transactionCount: number;
  transactionIds: string[];
  periodDate: string;
}

/**
 * Menghasilkan Keccak256 hash deterministik dari rangkuman transaksi kasir
 */
export function calculateBatchHash(payload: BatchPayload): string {
  // Sort transaction IDs for deterministic order
  const sortedTxIds = [...payload.transactionIds].sort();
  
  const canonicalString = JSON.stringify({
    merchantAddress: payload.merchantAddress.toLowerCase(),
    periodDate: payload.periodDate,
    totalRevenue: Math.round(payload.totalRevenue),
    transactionCount: payload.transactionCount,
    transactionIds: sortedTxIds,
  });

  return ethers.keccak256(ethers.toUtf8Bytes(canonicalString));
}
