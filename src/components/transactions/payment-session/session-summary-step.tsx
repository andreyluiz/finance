"use client";

import { CheckCircle2, ListChecks, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Muted } from "@/components/ui/typography";
import { formatAmount } from "./payment-session-utils";
import type { SessionResult } from "./types";

interface SessionSummaryStepProps {
  results: SessionResult;
  currency: string;
  onClose: () => void;
  isClosing: boolean;
}

export function SessionSummaryStep({
  results,
  currency,
  onClose,
  isClosing,
}: SessionSummaryStepProps) {
  const paidTotal = results.paid.reduce(
    (sum, transaction) => sum + Number(transaction.value),
    0,
  );
  const skippedTotal = results.skipped.reduce(
    (sum, transaction) => sum + Number(transaction.value),
    0,
  );
  const totalProcessed = results.paid.length + results.skipped.length;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <ListChecks className="h-10 w-10 text-primary" />
        <h3 className="text-2xl font-semibold">Session complete</h3>
        <Muted>
          Review what was paid and skipped. You can revisit any skipped
          transactions from the transactions list.
        </Muted>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-border p-4 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <p className="text-sm font-semibold">Paid</p>
          </div>
          <p className="text-3xl font-semibold">
            {formatAmount(paidTotal, currency)}
          </p>
          <Muted>{results.paid.length} transaction(s)</Muted>
        </Card>

        <Card className="border-border p-4 space-y-2">
          <div className="flex items-center gap-2">
            <SkipForward className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm font-semibold">Skipped</p>
          </div>
          <p className="text-3xl font-semibold">
            {formatAmount(skippedTotal, currency)}
          </p>
          <Muted>{results.skipped.length} transaction(s)</Muted>
        </Card>
      </div>

      <Card className="border-border p-4 space-y-2">
        <p className="text-sm text-muted-foreground">Summary</p>
        <p className="text-lg font-semibold">
          {totalProcessed} transaction(s) reviewed
        </p>
        <Muted>
          Paid items are now marked as complete. Skipped items remain unpaid and
          stay in their current billing period.
        </Muted>
      </Card>

      <Button
        onClick={onClose}
        disabled={isClosing}
        className="w-full sm:w-auto"
      >
        {isClosing ? "Updating..." : "Close session"}
      </Button>
    </div>
  );
}
