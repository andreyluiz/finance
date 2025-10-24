"use client";

import { useQueryClient } from "@tanstack/react-query";
import { PlayCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useReducer, useState } from "react";
import { toast } from "sonner";
import { updateTransactionPaidAction } from "@/actions/transaction-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Muted } from "@/components/ui/typography";
import type { Transaction } from "@/db/schema";
import { QUERY_KEYS } from "@/lib/react-query";
import type { BillingPeriod } from "@/lib/utils/billing-period";
import { initialState, paymentSessionReducer } from "./payment-session-reducer";
import {
  calculateSelectedTotal,
  getCurrentPeriodIncome,
  groupExpensesByPeriod,
} from "./payment-session-utils";
import { SessionRunnerStep } from "./session-runner-step";
import { SessionSelectionStep } from "./session-selection-step";
import { SessionSummaryStep } from "./session-summary-step";
import type { SessionTransaction } from "./types";

interface PaymentSessionLauncherProps {
  transactions: Transaction[];
  billingPeriod?: BillingPeriod | null;
}

export function PaymentSessionLauncher({
  transactions,
  billingPeriod,
}: PaymentSessionLauncherProps) {
  const [open, setOpen] = useState(false);
  const [state, dispatch] = useReducer(paymentSessionReducer, initialState);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const queryClient = useQueryClient();
  const tLauncher = useTranslations("transactions.paymentSession.launcher");
  const tDialog = useTranslations("transactions.paymentSession.dialog");

  const { groups, currentPeriod } = useMemo(
    () => groupExpensesByPeriod(transactions, billingPeriod),
    [transactions, billingPeriod],
  );

  const allSessionTransactions = useMemo(() => {
    return groups.flatMap((group) => group.transactions);
  }, [groups]);

  const selectedTransactions = useMemo(() => {
    if (state.selectedIds.size === 0) return [];
    return allSessionTransactions.filter((transaction) =>
      state.selectedIds.has(transaction.id),
    );
  }, [allSessionTransactions, state.selectedIds]);

  const selectedTotal = useMemo(
    () => calculateSelectedTotal(selectedTransactions),
    [selectedTransactions],
  );

  const currentPeriodIncome = useMemo(
    () => getCurrentPeriodIncome(transactions, currentPeriod),
    [transactions, currentPeriod],
  );

  const requiresWarning =
    selectedTransactions.length > 0 && selectedTotal > currentPeriodIncome;

  const hasExpenses = allSessionTransactions.length > 0;

  const currency =
    selectedTransactions[0]?.currency ??
    allSessionTransactions[0]?.currency ??
    "USD";

  const currentTransaction =
    state.queue.length > 0 ? state.queue[state.index] : undefined;

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      dispatch({ type: "RESET" });
      setIsProcessing(false);
      setIsClosing(false);
    } else {
      // Reset warning acknowledgement when dialog opens fresh
      dispatch({
        type: "SET_SELECTED_IDS",
        payload: { selectedIds: new Set<string>(), warningAcknowledged: true },
      });
    }
  };

  const handleToggleTransaction = (transaction: SessionTransaction) => {
    const nextSelected = new Set(state.selectedIds);
    if (nextSelected.has(transaction.id)) {
      nextSelected.delete(transaction.id);
    } else {
      nextSelected.add(transaction.id);
    }

    const nextSelectedTransactions = allSessionTransactions.filter((item) =>
      nextSelected.has(item.id),
    );
    const nextTotal = calculateSelectedTotal(nextSelectedTransactions);
    const nextWarning =
      nextSelectedTransactions.length > 0 && nextTotal > currentPeriodIncome;

    dispatch({
      type: "SET_SELECTED_IDS",
      payload: {
        selectedIds: nextSelected,
        warningAcknowledged: !nextWarning,
      },
    });
  };

  const handleAcknowledgeWarning = () => {
    dispatch({ type: "ACK_WARNING" });
  };

  const handleContinue = () => {
    if (selectedTransactions.length === 0) {
      return;
    }

    const orderedQueue = [...selectedTransactions].sort(
      (a, b) => a.order - b.order,
    );

    dispatch({
      type: "SET_SELECTION",
      payload: {
        selectedIds: new Set(state.selectedIds),
        queue: orderedQueue,
        warningAcknowledged: true,
      },
    });
  };

  const handleSkip = () => {
    if (!currentTransaction) return;
    dispatch({
      type: "SKIP",
      payload: { transaction: currentTransaction },
    });
  };

  const handleMarkPaid = async () => {
    if (!currentTransaction) return;

    setIsProcessing(true);
    const optimisticTransaction = { ...currentTransaction, paid: true };

    queryClient.setQueryData(
      QUERY_KEYS.transactions,
      (old: Transaction[] = []) =>
        old.map((item) =>
          item.id === currentTransaction.id ? { ...item, paid: true } : item,
        ),
    );

    try {
      const result = await updateTransactionPaidAction(
        currentTransaction.id,
        true,
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to update transaction");
      }

      dispatch({
        type: "MARK_PAID",
        payload: { transaction: optimisticTransaction },
      });
    } catch (error) {
      queryClient.setQueryData(
        QUERY_KEYS.transactions,
        (old: Transaction[] = []) =>
          old.map((item) =>
            item.id === currentTransaction.id ? { ...item, paid: false } : item,
          ),
      );
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update transaction.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseSession = async () => {
    setIsClosing(true);
    try {
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.transactions,
      });
    } finally {
      setIsClosing(false);
      setOpen(false);
      dispatch({ type: "RESET" });
    }
  };

  const renderContent = () => {
    switch (state.phase) {
      case "selection":
        return (
          <SessionSelectionStep
            groups={groups}
            selectedIds={state.selectedIds}
            selectedCount={selectedTransactions.length}
            selectedTotal={selectedTotal}
            currentPeriodIncome={currentPeriodIncome}
            requiresWarning={requiresWarning}
            warningAcknowledged={state.warningAcknowledged}
            currency={currency}
            onToggleTransaction={handleToggleTransaction}
            onAcknowledgeWarning={handleAcknowledgeWarning}
            onContinue={handleContinue}
            onCancel={() => handleOpenChange(false)}
          />
        );
      case "runner":
        if (!currentTransaction) {
          return null;
        }
        return (
          <SessionRunnerStep
            transaction={currentTransaction}
            index={state.index}
            total={state.queue.length}
            onMarkPaid={handleMarkPaid}
            onSkip={handleSkip}
            isProcessing={isProcessing}
          />
        );
      case "summary":
        return (
          <SessionSummaryStep
            results={state.results}
            currency={currency}
            onClose={handleCloseSession}
            isClosing={isClosing}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
        <div>
          <p className="text-sm font-semibold">{tLauncher("title")}</p>
          <Muted>{tLauncher("description")}</Muted>
        </div>
        <Button onClick={() => handleOpenChange(true)} disabled={!hasExpenses}>
          <PlayCircle className="mr-2 h-4 w-4" />
          {tLauncher("startSession")}
        </Button>
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="md:min-w-2xl border-border">
          <DialogHeader>
            <DialogTitle>
              {state.phase === "runner"
                ? tDialog("titleRunner")
                : state.phase === "summary"
                  ? tDialog("titleSummary")
                  : tDialog("titleSelection")}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto">{renderContent()}</div>
        </DialogContent>
      </Dialog>
    </>
  );
}
