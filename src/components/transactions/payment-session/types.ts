import type { Transaction } from "@/db/schema";
import type { BillingPeriod } from "@/lib/utils/billing-period";

export type PaymentSessionPhase = "selection" | "runner" | "summary";

export interface SessionTransaction extends Transaction {
  order: number;
}

export interface SessionResult {
  paid: SessionTransaction[];
  skipped: SessionTransaction[];
}

export interface SessionPeriodGroup {
  label: string;
  period: BillingPeriod;
  transactions: SessionTransaction[];
}

export interface PaymentSessionState {
  phase: PaymentSessionPhase;
  selectedIds: Set<string>;
  queue: SessionTransaction[];
  index: number;
  results: SessionResult;
  warningAcknowledged: boolean;
}

export type PaymentSessionAction =
  | { type: "RESET" }
  | {
      type: "SET_SELECTED_IDS";
      payload: { selectedIds: Set<string>; warningAcknowledged: boolean };
    }
  | {
      type: "SET_SELECTION";
      payload: {
        selectedIds: Set<string>;
        queue: SessionTransaction[];
        warningAcknowledged: boolean;
      };
    }
  | { type: "START_SESSION" }
  | {
      type: "MARK_PAID";
      payload: { transaction: SessionTransaction };
    }
  | {
      type: "SKIP";
      payload: { transaction: SessionTransaction };
    }
  | { type: "FINISH" }
  | { type: "ACK_WARNING" };
