import type { Transaction } from "@/db/schema";
import type { BillingPeriod } from "./billing-period";

/**
 * Calculate savings rate as percentage
 * Formula: (Income - Expenses) / Income × 100
 */
export function calculateSavingsRate(income: number, expenses: number): number {
  if (income === 0) return 0;
  return ((income - expenses) / income) * 100;
}

/**
 * Get top N expenses for a given period
 */
export function getTopExpenses(
  transactions: Transaction[],
  billingPeriod: BillingPeriod,
  limit = 5,
): Transaction[] {
  return transactions
    .filter((t) => {
      if (t.type !== "expense") return false;
      const dueDate = new Date(t.dueDate);
      return (
        dueDate >= billingPeriod.startDate && dueDate < billingPeriod.endDate
      );
    })
    .sort((a, b) => Number(b.value) - Number(a.value))
    .slice(0, limit);
}

/**
 * Calculate payment performance metrics for the last 12 months
 */
export function calculatePaymentPerformance(transactions: Transaction[]): {
  onTimeRate: number;
  averageDaysToPayment: number;
  currentStreak: number;
} {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const paidExpenses = transactions.filter(
    (t) =>
      t.type === "expense" &&
      t.paid &&
      new Date(t.updatedAt) >= twelveMonthsAgo,
  );

  if (paidExpenses.length === 0) {
    return { onTimeRate: 0, averageDaysToPayment: 0, currentStreak: 0 };
  }

  // Calculate on-time rate
  const onTimeCount = paidExpenses.filter((t) => {
    const dueDate = new Date(t.dueDate);
    const paidDate = new Date(t.updatedAt);
    dueDate.setHours(0, 0, 0, 0);
    paidDate.setHours(0, 0, 0, 0);
    return paidDate <= dueDate;
  }).length;

  const onTimeRate = (onTimeCount / paidExpenses.length) * 100;

  // Calculate average days to payment
  const totalDays = paidExpenses.reduce((sum, t) => {
    const dueDate = new Date(t.dueDate);
    const paidDate = new Date(t.updatedAt);
    dueDate.setHours(0, 0, 0, 0);
    paidDate.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor(
      (paidDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    return sum + daysDiff;
  }, 0);

  const averageDaysToPayment = Math.round(totalDays / paidExpenses.length);

  // Calculate current streak (consecutive on-time payments)
  const sortedPaid = paidExpenses.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  let currentStreak = 0;
  for (const t of sortedPaid) {
    const dueDate = new Date(t.dueDate);
    const paidDate = new Date(t.updatedAt);
    dueDate.setHours(0, 0, 0, 0);
    paidDate.setHours(0, 0, 0, 0);

    if (paidDate <= dueDate) {
      currentStreak++;
    } else {
      break;
    }
  }

  return { onTimeRate, averageDaysToPayment, currentStreak };
}

/**
 * Project cash flow for the next N days
 */
export function projectCashFlow(
  transactions: Transaction[],
  currentBalance: number,
  days: number,
): Array<{ date: Date; projectedBalance: number }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + days);

  // Get all unpaid transactions in the forecast period
  const futureTransactions = transactions.filter((t) => {
    if (t.paid) return false;
    const dueDate = new Date(t.dueDate);
    return dueDate >= today && dueDate <= endDate;
  });

  // Group by date
  const projectionMap = new Map<string, number>();

  for (const t of futureTransactions) {
    const dateKey = new Date(t.dueDate).toISOString().split("T")[0];
    const current = projectionMap.get(dateKey) || 0;
    const change = t.type === "income" ? Number(t.value) : -Number(t.value);
    projectionMap.set(dateKey, current + change);
  }

  // Build daily projection
  const projection: Array<{ date: Date; projectedBalance: number }> = [];
  let runningBalance = currentBalance;

  for (let i = 0; i <= days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateKey = date.toISOString().split("T")[0];

    const dailyChange = projectionMap.get(dateKey) || 0;
    runningBalance += dailyChange;

    projection.push({
      date: new Date(date),
      projectedBalance: runningBalance,
    });
  }

  return projection;
}

/**
 * Get bills due in the next N days grouped by timeframe
 */
export function getBillsDueThisWeek(transactions: Transaction[]): {
  today: Transaction[];
  tomorrow: Transaction[];
  thisWeek: Transaction[];
  total: number;
} {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const unpaidExpenses = transactions.filter(
    (t) => t.type === "expense" && !t.paid,
  );

  const todayBills = unpaidExpenses.filter((t) => {
    const dueDate = new Date(t.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  });

  const tomorrowBills = unpaidExpenses.filter((t) => {
    const dueDate = new Date(t.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === tomorrow.getTime();
  });

  const thisWeekBills = unpaidExpenses.filter((t) => {
    const dueDate = new Date(t.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate > tomorrow && dueDate >= today && dueDate < weekEnd;
  });

  const totalAmount =
    todayBills.reduce((sum, t) => sum + Number(t.value), 0) +
    tomorrowBills.reduce((sum, t) => sum + Number(t.value), 0) +
    thisWeekBills.reduce((sum, t) => sum + Number(t.value), 0);

  return {
    today: todayBills,
    tomorrow: tomorrowBills,
    thisWeek: thisWeekBills,
    total: totalAmount,
  };
}

/**
 * Compare current period with previous period
 */
export function comparePeriods(
  transactions: Transaction[],
  currentPeriod: BillingPeriod,
  previousPeriod: BillingPeriod,
): {
  current: { income: number; expenses: number; balance: number };
  previous: { income: number; expenses: number; balance: number };
  changes: {
    income: { amount: number; percentage: number };
    expenses: { amount: number; percentage: number };
    balance: { amount: number; percentage: number };
  };
} {
  // Current period
  const currentIncome = transactions
    .filter((t) => {
      if (t.type !== "income") return false;
      const dueDate = new Date(t.dueDate);
      return (
        dueDate >= currentPeriod.startDate && dueDate < currentPeriod.endDate
      );
    })
    .reduce((sum, t) => sum + Number(t.value), 0);

  const currentExpenses = transactions
    .filter((t) => {
      if (t.type !== "expense") return false;
      const dueDate = new Date(t.dueDate);
      return (
        dueDate >= currentPeriod.startDate && dueDate < currentPeriod.endDate
      );
    })
    .reduce((sum, t) => sum + Number(t.value), 0);

  const currentBalance = currentIncome - currentExpenses;

  // Previous period
  const previousIncome = transactions
    .filter((t) => {
      if (t.type !== "income") return false;
      const dueDate = new Date(t.dueDate);
      return (
        dueDate >= previousPeriod.startDate && dueDate < previousPeriod.endDate
      );
    })
    .reduce((sum, t) => sum + Number(t.value), 0);

  const previousExpenses = transactions
    .filter((t) => {
      if (t.type !== "expense") return false;
      const dueDate = new Date(t.dueDate);
      return (
        dueDate >= previousPeriod.startDate && dueDate < previousPeriod.endDate
      );
    })
    .reduce((sum, t) => sum + Number(t.value), 0);

  const previousBalance = previousIncome - previousExpenses;

  // Calculate changes
  const incomeChange = currentIncome - previousIncome;
  const incomePercentage =
    previousIncome === 0 ? 0 : (incomeChange / previousIncome) * 100;

  const expensesChange = currentExpenses - previousExpenses;
  const expensesPercentage =
    previousExpenses === 0 ? 0 : (expensesChange / previousExpenses) * 100;

  const balanceChange = currentBalance - previousBalance;
  const balancePercentage =
    previousBalance === 0
      ? 0
      : (balanceChange / Math.abs(previousBalance)) * 100;

  return {
    current: {
      income: currentIncome,
      expenses: currentExpenses,
      balance: currentBalance,
    },
    previous: {
      income: previousIncome,
      expenses: previousExpenses,
      balance: previousBalance,
    },
    changes: {
      income: { amount: incomeChange, percentage: incomePercentage },
      expenses: { amount: expensesChange, percentage: expensesPercentage },
      balance: { amount: balanceChange, percentage: balancePercentage },
    },
  };
}
