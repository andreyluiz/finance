import { afterEach, describe, expect, it, vi } from "vitest";
import type { Transaction } from "@/db/schema";
import {
  type BillingPeriod,
  getBillingPeriod,
  getBillingPeriodDay,
} from "@/lib/utils/billing-period";
import {
  calculateSelectedTotal,
  getCurrentPeriodIncome,
  groupExpensesByPeriod,
} from "./payment-session-utils";
import type { SessionTransaction } from "./types";

vi.mock("@/lib/utils/billing-period", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/utils/billing-period")>();
  return {
    ...actual,
    getBillingPeriodDay: vi.fn(() => 15),
  };
});

let transactionCounter = 0;

const mockTransaction = (
  overrides: Partial<Transaction> = {},
): Transaction => ({
  id: overrides.id ?? `transaction-${transactionCounter++}`,
  userId: "user-1",
  name: "Expense",
  type: "expense",
  value: "50.00",
  currency: "USD",
  dueDate: new Date("2025-10-05T00:00:00Z"),
  priority: "medium",
  paid: false,
  installmentPlanId: null,
  installmentNumber: null,
  createdAt: new Date("2025-09-01T00:00:00Z"),
  updatedAt: new Date("2025-09-01T00:00:00Z"),
  ...overrides,
});

const toSession = (
  transaction: Transaction,
  order: number,
): SessionTransaction => ({
  ...transaction,
  order,
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("groupExpensesByPeriod", () => {
  const billingDay = 15;

  const selectedPeriod: BillingPeriod = getBillingPeriod(2025, 9, billingDay);
  const previousPeriod: BillingPeriod = getBillingPeriod(2025, 8, billingDay);
  const futurePeriod: BillingPeriod = getBillingPeriod(2025, 10, billingDay);

  it("orders groups starting with the selected period and labels it as current", () => {
    const transactions: Transaction[] = [
      mockTransaction({
        id: "selected-id",
        dueDate: new Date("2025-10-20T00:00:00Z"),
      }),
      mockTransaction({
        id: "previous-id",
        dueDate: new Date("2025-09-20T00:00:00Z"),
      }),
      mockTransaction({
        id: "future-id",
        dueDate: new Date("2025-11-01T00:00:00Z"),
      }),
    ];

    const { groups } = groupExpensesByPeriod(transactions, selectedPeriod);

    expect(groups).toHaveLength(2);
    expect(groups[0].label).toContain("(current)");
    expect(groups[0].transactions.map((item) => item.id)).toEqual([
      "selected-id",
    ]);
    expect(groups[1].transactions.map((item) => item.id)).toEqual([
      "previous-id",
    ]);
  });

  it("assigns increasing order values across groups", () => {
    const transactions: Transaction[] = [
      mockTransaction({
        id: "selected-first",
        dueDate: new Date("2025-10-18T00:00:00Z"),
      }),
      mockTransaction({
        id: "selected-second",
        dueDate: new Date("2025-10-28T00:00:00Z"),
      }),
      mockTransaction({
        id: "previous",
        dueDate: new Date("2025-09-20T00:00:00Z"),
      }),
    ];

    const { groups } = groupExpensesByPeriod(transactions, selectedPeriod);

    const orders = groups.flatMap((group) =>
      group.transactions.map((transaction) => transaction.order),
    );

    expect(orders).toEqual([0, 1, 2]);
  });

  it("excludes expenses that belong to future periods", () => {
    const futureTransaction = mockTransaction({
      id: "future",
      dueDate: futurePeriod.startDate,
    });

    const { groups } = groupExpensesByPeriod(
      [futureTransaction],
      previousPeriod,
    );

    expect(groups).toHaveLength(0);
  });
});

describe("calculateSelectedTotal", () => {
  it("sums the numeric value of session transactions", () => {
    const sessionTransactions: SessionTransaction[] = [
      toSession(mockTransaction({ value: "10.50" }), 0),
      toSession(mockTransaction({ value: "29.50" }), 1),
    ];

    expect(calculateSelectedTotal(sessionTransactions)).toBeCloseTo(40);
  });
});

describe("getCurrentPeriodIncome", () => {
  it("returns income totals for the provided period only", () => {
    const period = getBillingPeriod(2025, 7, getBillingPeriodDay());

    const transactions: Transaction[] = [
      mockTransaction({
        id: "income-in-period",
        type: "income",
        value: "400.00",
        dueDate: new Date(period.startDate.getTime() + 24 * 60 * 60 * 1000),
      }),
      mockTransaction({
        id: "income-outside",
        type: "income",
        value: "150.00",
        dueDate: new Date(period.endDate.getTime() + 24 * 60 * 60 * 1000),
      }),
      mockTransaction({
        id: "expense-ignored",
        type: "expense",
        value: "999.00",
        dueDate: period.startDate,
      }),
    ];

    expect(getCurrentPeriodIncome(transactions, period)).toBeCloseTo(400);
  });
});
