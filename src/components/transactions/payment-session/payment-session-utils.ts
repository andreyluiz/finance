import type { Transaction } from "@/db/schema";
import {
  type BillingPeriod,
  getBillingPeriod,
  getBillingPeriodDay,
  getCurrentBillingPeriod,
  getPreviousBillingPeriod,
  isDateInBillingPeriod,
} from "@/lib/utils/billing-period";
import type { SessionPeriodGroup, SessionTransaction } from "./types";

interface GroupedExpensesResult {
  groups: SessionPeriodGroup[];
  currentPeriod: SessionPeriodGroup["period"];
}

export function groupExpensesByPeriod(
  transactions: Transaction[],
  selectedPeriod?: BillingPeriod | null,
): GroupedExpensesResult {
  const billingDay = getBillingPeriodDay();
  const currentPeriod = selectedPeriod ?? getCurrentBillingPeriod();

  const expenses = transactions
    .filter(
      (transaction) => transaction.type === "expense" && !transaction.paid,
    )
    .map((transaction) => {
      const dueDate = new Date(transaction.dueDate);
      const basePeriod = getBillingPeriod(
        dueDate.getFullYear(),
        dueDate.getMonth(),
        billingDay,
      );
      const period = isDateInBillingPeriod(dueDate, basePeriod)
        ? basePeriod
        : getPreviousBillingPeriod(basePeriod);

      const periodEntry = {
        transaction,
        dueDate,
        period,
      };
      return periodEntry;
    });

  const map = new Map<string, SessionPeriodGroup>();

  for (const { transaction, period } of expenses) {
    if (period.startDate.getTime() > currentPeriod.startDate.getTime()) {
      continue;
    }
    const key = `${period.year}-${period.month}`;
    const label = formatPeriodLabel(period, currentPeriod);

    const existing = map.get(key);
    const sessionTransaction: SessionTransaction = {
      ...transaction,
      order: 0,
    };

    if (existing) {
      existing.transactions.push(sessionTransaction);
    } else {
      map.set(key, {
        label,
        period,
        transactions: [sessionTransaction],
      });
    }
  }

  const groups = Array.from(map.values()).sort((a, b) => {
    // Descending by period start date (current first, then past)
    return b.period.startDate.getTime() - a.period.startDate.getTime();
  });

  groups.forEach((group) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isCurrent =
      group.period.year === currentPeriod.year &&
      group.period.month === currentPeriod.month &&
      group.period.startDate.getTime() === currentPeriod.startDate.getTime();

    group.transactions.sort((a, b) => {
      // For current period, prioritize bills due today
      if (isCurrent) {
        const aDueDate = new Date(a.dueDate);
        aDueDate.setHours(0, 0, 0, 0);
        const bDueDate = new Date(b.dueDate);
        bDueDate.setHours(0, 0, 0, 0);

        const aIsDueToday = aDueDate.getTime() === today.getTime();
        const bIsDueToday = bDueDate.getTime() === today.getTime();

        // Bills due today come first
        if (aIsDueToday && !bIsDueToday) return -1;
        if (!aIsDueToday && bIsDueToday) return 1;
      }

      // Then sort by due date, then by name
      return (
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime() ||
        a.name.localeCompare(b.name)
      );
    });
  });

  // Assign order indexes in final flattened order
  let order = 0;
  for (const group of groups) {
    group.transactions = group.transactions.map((transaction) => ({
      ...transaction,
      order: order++,
    }));
  }

  return { groups, currentPeriod };
}

export function formatPeriodLabel(
  period: SessionPeriodGroup["period"],
  currentPeriod: SessionPeriodGroup["period"],
): string {
  const monthName = period.startDate.toLocaleDateString("en-US", {
    month: "long",
  });
  const label = `${monthName} ${period.year}`;

  const isCurrent =
    period.year === currentPeriod.year &&
    period.month === currentPeriod.month &&
    period.startDate.getTime() === currentPeriod.startDate.getTime();

  return isCurrent ? `${label} (current)` : label;
}

export function calculateSelectedTotal(selected: SessionTransaction[]): number {
  return selected.reduce((total, transaction) => {
    return total + Number(transaction.value);
  }, 0);
}

export function formatAmount(value: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(value);
}

export function getCurrentPeriodIncome(
  transactions: Transaction[],
  period: SessionPeriodGroup["period"],
): number {
  return transactions
    .filter((transaction) => transaction.type === "income")
    .filter((transaction) =>
      isDateInBillingPeriod(new Date(transaction.dueDate), period),
    )
    .reduce((total, transaction) => total + Number(transaction.value), 0);
}
