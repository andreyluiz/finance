"use client";

import { CheckCircle, Loader2, SkipForward } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  PRIORITY_BADGE_CLASSNAMES,
  TYPE_BADGE_CLASSNAMES,
} from "@/components/transactions/transaction-badge-variants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Muted } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { formatAmount } from "./payment-session-utils";
import type { SessionTransaction } from "./types";

interface SessionRunnerStepProps {
  transaction: SessionTransaction;
  index: number;
  total: number;
  onMarkPaid: () => Promise<void>;
  onSkip: () => void;
  isProcessing: boolean;
}

export function SessionRunnerStep({
  transaction,
  index,
  total,
  onMarkPaid,
  onSkip,
  isProcessing,
}: SessionRunnerStepProps) {
  const dueDate = new Date(transaction.dueDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const progressLabel = `Transaction ${index + 1} of ${total}`;
  const tPriority = useTranslations("transactions.priority");
  const tStatus = useTranslations("transactions.status");

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Muted className="text-sm uppercase tracking-wide">
          {progressLabel}
        </Muted>
        <h3 className="text-2xl font-semibold">{transaction.name}</h3>
        <p className="text-muted-foreground">
          Review the payment details and confirm when it has been processed.
        </p>
      </div>

      <Card className="border-border p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={TYPE_BADGE_CLASSNAMES[transaction.type]}
          >
            {tStatus(transaction.type)}
          </Badge>
          <Badge
            variant="outline"
            className={PRIORITY_BADGE_CLASSNAMES[transaction.priority]}
          >
            {tPriority(transaction.priority)}
          </Badge>
          {transaction.installmentNumber && (
            <Badge variant="outline">
              Installment {transaction.installmentNumber}
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Amount</p>
          <p className="text-3xl font-semibold text-red-600 dark:text-red-400">
            {formatAmount(Number(transaction.value), transaction.currency)}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Due date
            </p>
            <p className="text-sm font-semibold">{dueDate}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Currency
            </p>
            <p className="text-sm font-semibold">{transaction.currency}</p>
          </div>
        </div>
      </Card>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onSkip}
          disabled={isProcessing}
          className="sm:w-[180px]"
        >
          <SkipForward className="mr-2 h-4 w-4" />
          Skip
        </Button>
        <Button
          type="button"
          onClick={onMarkPaid}
          disabled={isProcessing}
          className={cn("sm:w-[220px]", isProcessing ? "opacity-90" : "")}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark as paid
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
