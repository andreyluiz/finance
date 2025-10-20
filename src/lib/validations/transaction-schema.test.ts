import { describe, expect, it } from "vitest";
import {
  priorityEnum,
  transactionSchema,
  transactionTypeEnum,
} from "./transaction-schema";

describe("transactionTypeEnum", () => {
  it("should accept valid transaction types", () => {
    expect(transactionTypeEnum.parse("income")).toBe("income");
    expect(transactionTypeEnum.parse("expense")).toBe("expense");
  });

  it("should reject invalid transaction types", () => {
    expect(() => transactionTypeEnum.parse("invalid")).toThrow();
    expect(() => transactionTypeEnum.parse("")).toThrow();
    expect(() => transactionTypeEnum.parse(null)).toThrow();
  });
});

describe("priorityEnum", () => {
  it("should accept all valid priority levels", () => {
    expect(priorityEnum.parse("very_high")).toBe("very_high");
    expect(priorityEnum.parse("high")).toBe("high");
    expect(priorityEnum.parse("medium")).toBe("medium");
    expect(priorityEnum.parse("low")).toBe("low");
    expect(priorityEnum.parse("very_low")).toBe("very_low");
  });

  it("should reject invalid priority levels", () => {
    expect(() => priorityEnum.parse("invalid")).toThrow();
    expect(() => priorityEnum.parse("")).toThrow();
    expect(() => priorityEnum.parse(null)).toThrow();
  });
});

describe("transactionSchema", () => {
  const validTransaction = {
    type: "expense" as const,
    name: "Test Transaction",
    value: 100.5,
    currency: "USD",
    dueDate: new Date("2025-12-31"),
    priority: "medium" as const,
    paid: false,
  };

  describe("type field", () => {
    it("should accept valid types", () => {
      const result = transactionSchema.safeParse({
        ...validTransaction,
        type: "income",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid types", () => {
      const result = transactionSchema.safeParse({
        ...validTransaction,
        type: "invalid",
      });
      expect(result.success).toBe(false);
    });

    it("should be required", () => {
      const { type: _type, ...withoutType } = validTransaction;
      const result = transactionSchema.safeParse(withoutType);
      expect(result.success).toBe(false);
    });
  });

  describe("name field", () => {
    it("should accept valid names", () => {
      const result = transactionSchema.safeParse({
        ...validTransaction,
        name: "Valid Name",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty names", () => {
      const result = transactionSchema.safeParse({
        ...validTransaction,
        name: "",
      });
      expect(result.success).toBe(false);
    });

    it("should be required", () => {
      const { name: _name, ...withoutName } = validTransaction;
      const result = transactionSchema.safeParse(withoutName);
      expect(result.success).toBe(false);
    });
  });

  describe("value field", () => {
    it("should accept positive numbers", () => {
      const result = transactionSchema.safeParse({
        ...validTransaction,
        value: 100.5,
      });
      expect(result.success).toBe(true);
    });

    it("should coerce string numbers to numbers", () => {
      const result = transactionSchema.safeParse({
        ...validTransaction,
        value: "100.50",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.value).toBe(100.5);
      }
    });

    it("should reject negative numbers", () => {
      const result = transactionSchema.safeParse({
        ...validTransaction,
        value: -10,
      });
      expect(result.success).toBe(false);
    });

    it("should reject zero", () => {
      const result = transactionSchema.safeParse({
        ...validTransaction,
        value: 0,
      });
      expect(result.success).toBe(false);
    });

    it("should reject values with more than 2 decimal places", () => {
      const result = transactionSchema.safeParse({
        ...validTransaction,
        value: 100.123,
      });
      expect(result.success).toBe(false);
    });

    it("should accept values with exactly 2 decimal places", () => {
      const result = transactionSchema.safeParse({
        ...validTransaction,
        value: 100.12,
      });
      expect(result.success).toBe(true);
    });

    it("should reject non-numeric values", () => {
      const result = transactionSchema.safeParse({
        ...validTransaction,
        value: "not a number",
      });
      expect(result.success).toBe(false);
    });

    it("should be required", () => {
      const { value: _value, ...withoutValue } = validTransaction;
      const result = transactionSchema.safeParse(withoutValue);
      expect(result.success).toBe(false);
    });
  });

  describe("currency field", () => {
    it("should accept valid currency codes", () => {
      const result = transactionSchema.safeParse({
        ...validTransaction,
        currency: "EUR",
      });
      expect(result.success).toBe(true);
    });

    it("should default to USD if not provided", () => {
      const { currency: _currency, ...withoutCurrency } = validTransaction;
      const result = transactionSchema.safeParse(withoutCurrency);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currency).toBe("USD");
      }
    });
  });

  describe("dueDate field", () => {
    it("should accept valid dates", () => {
      const result = transactionSchema.safeParse({
        ...validTransaction,
        dueDate: new Date("2025-12-31"),
      });
      expect(result.success).toBe(true);
    });

    it("should be required", () => {
      const { dueDate: _dueDate, ...withoutDueDate } = validTransaction;
      const result = transactionSchema.safeParse(withoutDueDate);
      expect(result.success).toBe(false);
    });
  });

  describe("priority field", () => {
    it("should accept all valid priority levels", () => {
      const priorities = ["very_high", "high", "medium", "low", "very_low"];
      for (const priority of priorities) {
        const result = transactionSchema.safeParse({
          ...validTransaction,
          priority,
        });
        expect(result.success).toBe(true);
      }
    });

    it("should reject invalid priority levels", () => {
      const result = transactionSchema.safeParse({
        ...validTransaction,
        priority: "invalid",
      });
      expect(result.success).toBe(false);
    });

    it("should be required", () => {
      const { priority: _priority, ...withoutPriority } = validTransaction;
      const result = transactionSchema.safeParse(withoutPriority);
      expect(result.success).toBe(false);
    });
  });

  describe("paid field", () => {
    it("should accept boolean values", () => {
      const resultTrue = transactionSchema.safeParse({
        ...validTransaction,
        paid: true,
      });
      expect(resultTrue.success).toBe(true);

      const resultFalse = transactionSchema.safeParse({
        ...validTransaction,
        paid: false,
      });
      expect(resultFalse.success).toBe(true);
    });

    it("should default to false if not provided", () => {
      const { paid: _paid, ...withoutPaid } = validTransaction;
      const result = transactionSchema.safeParse(withoutPaid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.paid).toBe(false);
      }
    });
  });

  describe("complete validation", () => {
    it("should accept a complete valid transaction", () => {
      const result = transactionSchema.safeParse(validTransaction);
      expect(result.success).toBe(true);
    });

    it("should accept a complete valid income transaction", () => {
      const result = transactionSchema.safeParse({
        ...validTransaction,
        type: "income",
      });
      expect(result.success).toBe(true);
    });
  });
});
