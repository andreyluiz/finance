import type { Transaction } from "@/db/schema";

const priorityOrder = {
  very_high: 0,
  high: 1,
  medium: 2,
  low: 3,
  very_low: 4,
} as const;

export function sortTransactions(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => {
    // Primary: unpaid first
    if (a.paid !== b.paid) {
      return a.paid ? 1 : -1;
    }

    // Secondary: by priority
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    // Tertiary: newest first
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}
