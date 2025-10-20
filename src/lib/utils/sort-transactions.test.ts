import { describe, expect, it } from "vitest";
import type { Transaction } from "@/db/schema";
import { sortTransactions } from "./sort-transactions";

// Helper function to create a mock transaction
function createMockTransaction(
  overrides: Partial<Transaction> = {},
): Transaction {
  return {
    id: "test-id",
    userId: "test-user",
    type: "expense",
    name: "Test Transaction",
    value: "100.00",
    currency: "USD",
    dueDate: new Date("2025-12-31"),
    priority: "medium",
    paid: false,
    createdAt: new Date("2025-10-01"),
    updatedAt: new Date("2025-10-01"),
    installmentPlanId: null,
    installmentNumber: null,
    ...overrides,
  } satisfies Transaction;
}

describe("sortTransactions", () => {
  describe("paid status sorting", () => {
    it("should sort unpaid transactions before paid ones", () => {
      const transactions: Transaction[] = [
        createMockTransaction({ id: "1", paid: true }),
        createMockTransaction({ id: "2", paid: false }),
        createMockTransaction({ id: "3", paid: true }),
        createMockTransaction({ id: "4", paid: false }),
      ];

      const sorted = sortTransactions(transactions);

      expect(sorted[0]?.paid).toBe(false);
      expect(sorted[1]?.paid).toBe(false);
      expect(sorted[2]?.paid).toBe(true);
      expect(sorted[3]?.paid).toBe(true);
    });
  });

  describe("priority sorting", () => {
    it("should sort by priority within unpaid transactions", () => {
      const transactions: Transaction[] = [
        createMockTransaction({ id: "1", priority: "low", paid: false }),
        createMockTransaction({ id: "2", priority: "very_high", paid: false }),
        createMockTransaction({ id: "3", priority: "medium", paid: false }),
        createMockTransaction({ id: "4", priority: "high", paid: false }),
        createMockTransaction({ id: "5", priority: "very_low", paid: false }),
      ];

      const sorted = sortTransactions(transactions);

      expect(sorted[0]?.priority).toBe("very_high");
      expect(sorted[1]?.priority).toBe("high");
      expect(sorted[2]?.priority).toBe("medium");
      expect(sorted[3]?.priority).toBe("low");
      expect(sorted[4]?.priority).toBe("very_low");
    });

    it("should sort by priority within paid transactions", () => {
      const transactions: Transaction[] = [
        createMockTransaction({ id: "1", priority: "low", paid: true }),
        createMockTransaction({ id: "2", priority: "very_high", paid: true }),
        createMockTransaction({ id: "3", priority: "medium", paid: true }),
        createMockTransaction({ id: "4", priority: "high", paid: true }),
        createMockTransaction({ id: "5", priority: "very_low", paid: true }),
      ];

      const sorted = sortTransactions(transactions);

      expect(sorted[0]?.priority).toBe("very_high");
      expect(sorted[1]?.priority).toBe("high");
      expect(sorted[2]?.priority).toBe("medium");
      expect(sorted[3]?.priority).toBe("low");
      expect(sorted[4]?.priority).toBe("very_low");
    });
  });

  describe("creation date sorting", () => {
    it("should sort by newest first within same priority and paid status", () => {
      const transactions: Transaction[] = [
        createMockTransaction({
          id: "1",
          priority: "high",
          paid: false,
          createdAt: new Date("2025-10-01"),
        }),
        createMockTransaction({
          id: "2",
          priority: "high",
          paid: false,
          createdAt: new Date("2025-10-03"),
        }),
        createMockTransaction({
          id: "3",
          priority: "high",
          paid: false,
          createdAt: new Date("2025-10-02"),
        }),
      ];

      const sorted = sortTransactions(transactions);

      // Should be ordered by newest first
      expect(sorted[0]?.id).toBe("2"); // Oct 3
      expect(sorted[1]?.id).toBe("3"); // Oct 2
      expect(sorted[2]?.id).toBe("1"); // Oct 1
    });
  });

  describe("combined sorting rules", () => {
    it("should correctly apply all sorting rules in order", () => {
      const transactions: Transaction[] = [
        createMockTransaction({
          id: "1",
          priority: "low",
          paid: true,
          createdAt: new Date("2025-10-05"),
        }),
        createMockTransaction({
          id: "2",
          priority: "high",
          paid: false,
          createdAt: new Date("2025-10-01"),
        }),
        createMockTransaction({
          id: "3",
          priority: "high",
          paid: false,
          createdAt: new Date("2025-10-03"),
        }),
        createMockTransaction({
          id: "4",
          priority: "medium",
          paid: false,
          createdAt: new Date("2025-10-04"),
        }),
        createMockTransaction({
          id: "5",
          priority: "high",
          paid: true,
          createdAt: new Date("2025-10-02"),
        }),
      ];

      const sorted = sortTransactions(transactions);

      // Expected order:
      // 1. Unpaid high priority, newest first (id 3, then 2)
      // 2. Unpaid medium priority (id 4)
      // 3. Paid high priority (id 5)
      // 4. Paid low priority (id 1)
      expect(sorted[0]?.id).toBe("3");
      expect(sorted[1]?.id).toBe("2");
      expect(sorted[2]?.id).toBe("4");
      expect(sorted[3]?.id).toBe("5");
      expect(sorted[4]?.id).toBe("1");
    });
  });

  describe("edge cases", () => {
    it("should handle empty array", () => {
      const transactions: Transaction[] = [];
      const sorted = sortTransactions(transactions);
      expect(sorted).toEqual([]);
    });

    it("should handle single transaction", () => {
      const transactions: Transaction[] = [createMockTransaction({ id: "1" })];
      const sorted = sortTransactions(transactions);
      expect(sorted).toHaveLength(1);
      expect(sorted[0]?.id).toBe("1");
    });

    it("should not mutate the original array", () => {
      const transactions: Transaction[] = [
        createMockTransaction({ id: "1", priority: "low" }),
        createMockTransaction({ id: "2", priority: "high" }),
      ];
      const original = [...transactions];

      sortTransactions(transactions);

      expect(transactions).toEqual(original);
    });

    it("should handle transactions with same creation time", () => {
      const sameDate = new Date("2025-10-01");
      const transactions: Transaction[] = [
        createMockTransaction({
          id: "1",
          priority: "medium",
          paid: false,
          createdAt: sameDate,
        }),
        createMockTransaction({
          id: "2",
          priority: "medium",
          paid: false,
          createdAt: sameDate,
        }),
      ];

      const sorted = sortTransactions(transactions);

      // Should maintain stable sort or return consistent order
      expect(sorted).toHaveLength(2);
      expect(sorted[0]?.priority).toBe("medium");
      expect(sorted[1]?.priority).toBe("medium");
    });
  });

  describe("realistic scenarios", () => {
    it("should correctly sort a mixed set of transactions", () => {
      const transactions: Transaction[] = [
        createMockTransaction({
          id: "rent",
          name: "Rent",
          priority: "very_high",
          paid: false,
          createdAt: new Date("2025-10-01"),
        }),
        createMockTransaction({
          id: "netflix",
          name: "Netflix",
          priority: "low",
          paid: true,
          createdAt: new Date("2025-10-15"),
        }),
        createMockTransaction({
          id: "groceries",
          name: "Groceries",
          priority: "high",
          paid: false,
          createdAt: new Date("2025-10-10"),
        }),
        createMockTransaction({
          id: "salary",
          name: "Salary",
          type: "income",
          priority: "very_high",
          paid: true,
          createdAt: new Date("2025-10-01"),
        }),
        createMockTransaction({
          id: "gas",
          name: "Gas",
          priority: "medium",
          paid: false,
          createdAt: new Date("2025-10-12"),
        }),
      ];

      const sorted = sortTransactions(transactions);

      // Expected order:
      // 1. Unpaid: rent (very_high), groceries (high), gas (medium)
      // 2. Paid: salary (very_high), netflix (low)
      expect(sorted[0]?.id).toBe("rent");
      expect(sorted[1]?.id).toBe("groceries");
      expect(sorted[2]?.id).toBe("gas");
      expect(sorted[3]?.id).toBe("salary");
      expect(sorted[4]?.id).toBe("netflix");
    });
  });
});
