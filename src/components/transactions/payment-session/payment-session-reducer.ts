import type {
  PaymentSessionAction,
  PaymentSessionState,
  SessionTransaction,
} from "./types";

const initialResults = () => ({
  paid: [] as SessionTransaction[],
  skipped: [] as SessionTransaction[],
});

export const initialState: PaymentSessionState = {
  phase: "selection",
  selectedIds: new Set<string>(),
  queue: [],
  index: 0,
  results: initialResults(),
  warningAcknowledged: true,
};

export function paymentSessionReducer(
  state: PaymentSessionState,
  action: PaymentSessionAction,
): PaymentSessionState {
  switch (action.type) {
    case "RESET":
      return {
        ...initialState,
        selectedIds: new Set<string>(),
      };
    case "SET_SELECTED_IDS":
      return {
        ...state,
        selectedIds: action.payload.selectedIds,
        warningAcknowledged: action.payload.warningAcknowledged,
      };
    case "SET_SELECTION": {
      return {
        ...state,
        selectedIds: action.payload.selectedIds,
        queue: action.payload.queue,
        index: 0,
        results: initialResults(),
        phase: action.payload.queue.length > 0 ? "runner" : "selection",
        warningAcknowledged: action.payload.warningAcknowledged,
      };
    }
    case "START_SESSION":
      return {
        ...state,
        phase: state.queue.length > 0 ? "runner" : "selection",
      };
    case "MARK_PAID": {
      const paid = [...state.results.paid, action.payload.transaction];
      const nextIndex = state.index + 1;
      return {
        ...state,
        index: nextIndex,
        results: { ...state.results, paid },
        phase: nextIndex >= state.queue.length ? "summary" : state.phase,
      };
    }
    case "SKIP": {
      const skipped = [...state.results.skipped, action.payload.transaction];
      const nextIndex = state.index + 1;
      return {
        ...state,
        index: nextIndex,
        results: { ...state.results, skipped },
        phase: nextIndex >= state.queue.length ? "summary" : state.phase,
      };
    }
    case "FINISH":
      return {
        ...state,
        phase: "summary",
      };
    case "ACK_WARNING":
      return {
        ...state,
        warningAcknowledged: true,
      };
    default:
      return state;
  }
}
