import { describe, expect, it } from "vitest";
import { initialState, paymentSessionReducer } from "./payment-session-reducer";
import type { PaymentSessionState, SessionTransaction } from "./types";

function createState(overrides: Partial<PaymentSessionState> = {}) {
  return {
    ...initialState,
    selectedIds: new Set(initialState.selectedIds),
    queue: [...initialState.queue],
    results: {
      paid: [...initialState.results.paid],
      skipped: [...initialState.results.skipped],
    },
    ...overrides,
  };
}

const baseTransaction = (id: string): SessionTransaction => ({
  id,
  userId: "user-1",
  name: `Transaction ${id}`,
  type: "expense",
  value: "75.00",
  currency: "USD",
  dueDate: new Date("2025-01-05T00:00:00Z"),
  priority: "medium",
  paid: false,
  createdAt: new Date("2024-12-01T00:00:00Z"),
  updatedAt: new Date("2024-12-01T00:00:00Z"),
  order: Number.parseInt(id, 10),
  installmentPlanId: null,
  installmentNumber: null,
});

describe("paymentSessionReducer", () => {
  it("resets state with RESET action", () => {
    const populatedState = createState({
      phase: "summary",
      selectedIds: new Set(["1"]),
      queue: [baseTransaction("1")],
      results: {
        paid: [baseTransaction("1")],
        skipped: [],
      },
      index: 1,
      warningAcknowledged: false,
    });

    const result = paymentSessionReducer(populatedState, { type: "RESET" });

    expect(result.phase).toBe("selection");
    expect(result.selectedIds.size).toBe(0);
    expect(result.queue).toHaveLength(0);
    expect(result.results.paid).toHaveLength(0);
    expect(result.results.skipped).toHaveLength(0);
    expect(result.warningAcknowledged).toBe(true);
  });

  it("updates selected ids and warning acknowledgement with SET_SELECTED_IDS", () => {
    const state = createState();
    const nextIds = new Set(["1", "2"]);

    const result = paymentSessionReducer(state, {
      type: "SET_SELECTED_IDS",
      payload: {
        selectedIds: nextIds,
        warningAcknowledged: false,
      },
    });

    expect(Array.from(result.selectedIds)).toEqual(["1", "2"]);
    expect(result.warningAcknowledged).toBe(false);
  });

  it("moves to runner phase when selection queue is provided", () => {
    const queue = [baseTransaction("1"), baseTransaction("2")];
    const state = createState();

    const result = paymentSessionReducer(state, {
      type: "SET_SELECTION",
      payload: {
        selectedIds: new Set(["1", "2"]),
        queue,
        warningAcknowledged: true,
      },
    });

    expect(result.phase).toBe("runner");
    expect(result.queue).toEqual(queue);
    expect(result.index).toBe(0);
    expect(result.results.paid).toHaveLength(0);
  });

  it("records paid transactions and advances to summary when queue completes", () => {
    const transaction = baseTransaction("1");
    const state = createState({
      phase: "runner",
      queue: [transaction],
      selectedIds: new Set(["1"]),
    });

    const result = paymentSessionReducer(state, {
      type: "MARK_PAID",
      payload: { transaction },
    });

    expect(result.results.paid).toEqual([transaction]);
    expect(result.index).toBe(1);
    expect(result.phase).toBe("summary");
  });

  it("records skipped transactions and keeps runner active when items remain", () => {
    const queue = [baseTransaction("1"), baseTransaction("2")];
    const state = createState({
      phase: "runner",
      queue,
      selectedIds: new Set(["1", "2"]),
    });

    const firstSkip = paymentSessionReducer(state, {
      type: "SKIP",
      payload: { transaction: queue[0] },
    });

    expect(firstSkip.results.skipped).toEqual([queue[0]]);
    expect(firstSkip.index).toBe(1);
    expect(firstSkip.phase).toBe("runner");

    const secondSkip = paymentSessionReducer(firstSkip, {
      type: "SKIP",
      payload: { transaction: queue[1] },
    });

    expect(secondSkip.results.skipped).toEqual(queue);
    expect(secondSkip.index).toBe(2);
    expect(secondSkip.phase).toBe("summary");
  });
});
