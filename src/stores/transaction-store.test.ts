import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import type { Transaction } from "@/db/schema";
import { useTransactionStore } from "./transaction-store";

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
    installmentPlanId: null,
    installmentNumber: null,
    createdAt: new Date("2025-10-01"),
    updatedAt: new Date("2025-10-01"),
    ...overrides,
  };
}

describe("useTransactionStore", () => {
  beforeEach(() => {
    // Reset the store before each test
    const { result } = renderHook(() => useTransactionStore());
    act(() => {
      result.current.clearEditMode();
    });
  });

  describe("initial state", () => {
    it("should have null editingTransaction", () => {
      const { result } = renderHook(() => useTransactionStore());
      expect(result.current.editingTransaction).toBeNull();
    });

    it("should have isEditMode set to false", () => {
      const { result } = renderHook(() => useTransactionStore());
      expect(result.current.isEditMode).toBe(false);
    });
  });

  describe("setEditingTransaction", () => {
    it("should set the editing transaction", () => {
      const { result } = renderHook(() => useTransactionStore());
      const mockTransaction = createMockTransaction({ id: "test-123" });

      act(() => {
        result.current.setEditingTransaction(mockTransaction);
      });

      expect(result.current.editingTransaction).toEqual(mockTransaction);
    });

    it("should set isEditMode to true when transaction is provided", () => {
      const { result } = renderHook(() => useTransactionStore());
      const mockTransaction = createMockTransaction();

      act(() => {
        result.current.setEditingTransaction(mockTransaction);
      });

      expect(result.current.isEditMode).toBe(true);
    });

    it("should set isEditMode to false when null is provided", () => {
      const { result } = renderHook(() => useTransactionStore());

      // First set a transaction
      act(() => {
        result.current.setEditingTransaction(createMockTransaction());
      });

      // Then set to null
      act(() => {
        result.current.setEditingTransaction(null);
      });

      expect(result.current.isEditMode).toBe(false);
      expect(result.current.editingTransaction).toBeNull();
    });

    it("should update with a different transaction", () => {
      const { result } = renderHook(() => useTransactionStore());
      const transaction1 = createMockTransaction({ id: "1", name: "First" });
      const transaction2 = createMockTransaction({ id: "2", name: "Second" });

      act(() => {
        result.current.setEditingTransaction(transaction1);
      });

      expect(result.current.editingTransaction?.id).toBe("1");

      act(() => {
        result.current.setEditingTransaction(transaction2);
      });

      expect(result.current.editingTransaction?.id).toBe("2");
      expect(result.current.editingTransaction?.name).toBe("Second");
      expect(result.current.isEditMode).toBe(true);
    });
  });

  describe("clearEditMode", () => {
    it("should clear the editing transaction", () => {
      const { result } = renderHook(() => useTransactionStore());
      const mockTransaction = createMockTransaction();

      act(() => {
        result.current.setEditingTransaction(mockTransaction);
      });

      expect(result.current.editingTransaction).not.toBeNull();

      act(() => {
        result.current.clearEditMode();
      });

      expect(result.current.editingTransaction).toBeNull();
    });

    it("should set isEditMode to false", () => {
      const { result } = renderHook(() => useTransactionStore());
      const mockTransaction = createMockTransaction();

      act(() => {
        result.current.setEditingTransaction(mockTransaction);
      });

      expect(result.current.isEditMode).toBe(true);

      act(() => {
        result.current.clearEditMode();
      });

      expect(result.current.isEditMode).toBe(false);
    });

    it("should work even when already cleared", () => {
      const { result } = renderHook(() => useTransactionStore());

      act(() => {
        result.current.clearEditMode();
      });

      expect(result.current.editingTransaction).toBeNull();
      expect(result.current.isEditMode).toBe(false);
    });
  });

  describe("workflows", () => {
    it("should handle edit -> clear -> edit workflow", () => {
      const { result } = renderHook(() => useTransactionStore());
      const transaction1 = createMockTransaction({ id: "1" });
      const transaction2 = createMockTransaction({ id: "2" });

      // Edit first transaction
      act(() => {
        result.current.setEditingTransaction(transaction1);
      });
      expect(result.current.editingTransaction?.id).toBe("1");
      expect(result.current.isEditMode).toBe(true);

      // Clear
      act(() => {
        result.current.clearEditMode();
      });
      expect(result.current.editingTransaction).toBeNull();
      expect(result.current.isEditMode).toBe(false);

      // Edit second transaction
      act(() => {
        result.current.setEditingTransaction(transaction2);
      });
      expect(result.current.editingTransaction?.id).toBe("2");
      expect(result.current.isEditMode).toBe(true);
    });

    it("should handle multiple edits without clearing", () => {
      const { result } = renderHook(() => useTransactionStore());
      const transaction1 = createMockTransaction({ id: "1", name: "First" });
      const transaction2 = createMockTransaction({ id: "2", name: "Second" });
      const transaction3 = createMockTransaction({ id: "3", name: "Third" });

      act(() => {
        result.current.setEditingTransaction(transaction1);
      });
      expect(result.current.editingTransaction?.name).toBe("First");

      act(() => {
        result.current.setEditingTransaction(transaction2);
      });
      expect(result.current.editingTransaction?.name).toBe("Second");

      act(() => {
        result.current.setEditingTransaction(transaction3);
      });
      expect(result.current.editingTransaction?.name).toBe("Third");
      expect(result.current.isEditMode).toBe(true);
    });
  });

  describe("store persistence", () => {
    it("should maintain state across multiple hook renders", () => {
      const mockTransaction = createMockTransaction({ id: "persist-test" });

      // First render
      const { result: result1 } = renderHook(() => useTransactionStore());
      act(() => {
        result1.current.setEditingTransaction(mockTransaction);
      });

      // Second render (simulating different component)
      const { result: result2 } = renderHook(() => useTransactionStore());
      expect(result2.current.editingTransaction?.id).toBe("persist-test");
      expect(result2.current.isEditMode).toBe(true);
    });
  });
});
