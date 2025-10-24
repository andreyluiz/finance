"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { getTransactionsAction } from "@/actions/transaction-actions";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Muted } from "@/components/ui/typography";
import { QUERY_KEYS } from "@/lib/react-query";
import {
  type BillingPeriod,
  isDateInBillingPeriod,
} from "@/lib/utils/billing-period";
import { TransactionCard } from "./transaction-card";

interface TransactionListProps {
  className?: string;
  billingPeriod?: BillingPeriod;
  showPastOverdue?: boolean;
}

export function TransactionList({
  className,
  billingPeriod,
  showPastOverdue = true,
}: TransactionListProps) {
  const [showOverdue, setShowOverdue] = useState(false);
  const [showPaid, setShowPaid] = useState(false);
  const t = useTranslations("common");

  const {
    data: transactions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.transactions,
    queryFn: getTransactionsAction,
  });

  // Filter transactions by billing period if provided
  const filteredTransactions = billingPeriod
    ? transactions.filter((transaction) =>
        isDateInBillingPeriod(new Date(transaction.dueDate), billingPeriod),
      )
    : transactions;

  const paidTransactions = filteredTransactions.filter(
    (transaction) => transaction.paid,
  );
  const unpaidTransactions = filteredTransactions.filter(
    (transaction) => !transaction.paid,
  );

  // Filter overdue expenses from past periods (before current billing period)
  const overdueFromPast = billingPeriod
    ? transactions.filter((transaction) => {
        const dueDate = new Date(transaction.dueDate);
        return (
          transaction.type === "expense" &&
          !transaction.paid &&
          dueDate < billingPeriod.startDate
        );
      })
    : [];

  if (isLoading) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center p-8">
          <Muted>{t("loading")}</Muted>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center p-8">
          <Muted className="text-destructive">
            Error loading {t("transactions").toLowerCase()}. Please try again.
          </Muted>
        </div>
      </div>
    );
  }

  if (filteredTransactions.length === 0) {
    return (
      <div className={className}>
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Muted>
            {billingPeriod
              ? `No ${t("transactions").toLowerCase()} for this billing period.`
              : `No ${t("transactions").toLowerCase()} yet.`}
          </Muted>
          <Muted>
            {billingPeriod
              ? "Try selecting a different period or create a new transaction."
              : "Create your first transaction to get started!"}
          </Muted>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Transaction Count */}
      {billingPeriod && (
        <div className="mb-3 text-sm text-muted-foreground">
          Showing {filteredTransactions.length} transaction
          {filteredTransactions.length !== 1 ? "s" : ""}
        </div>
      )}

      <div className="space-y-4">
        {/* Overdue from Past Periods Section */}
        {showPastOverdue && billingPeriod && overdueFromPast.length > 0 && (
          <Collapsible
            open={showOverdue}
            onOpenChange={setShowOverdue}
            className="border border-destructive rounded-lg bg-destructive/5"
          >
            <CollapsibleTrigger className="w-full px-4 py-3 hover:bg-destructive/10 rounded-lg transition-colors">
              <div className="flex items-center gap-2">
                {showOverdue ? (
                  <ChevronDown className="h-4 w-4 text-destructive" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-destructive" />
                )}
                <span className="font-semibold text-destructive">
                  {t("overdueFromPast")}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({overdueFromPast.length} {t("unpaidExpense")}
                  {overdueFromPast.length !== 1 ? "s" : ""})
                </span>
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent className="px-4 pb-4 space-y-3">
              {overdueFromPast.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                />
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Current Period Transactions */}
        {unpaidTransactions.map((transaction) => (
          <TransactionCard key={transaction.id} transaction={transaction} />
        ))}

        {/* Paid Transactions */}
        {paidTransactions.length > 0 && (
          <Collapsible
            open={showPaid}
            onOpenChange={setShowPaid}
            className="border border-border rounded-lg bg-muted/30"
          >
            <CollapsibleTrigger className="w-full px-4 py-3 hover:bg-muted/40 rounded-lg transition-colors">
              <div className="flex items-center gap-2">
                {showPaid ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-semibold">{t("paidTransactions")}</span>
                <span className="text-sm text-muted-foreground">
                  ({paidTransactions.length} {t("transactions").toLowerCase()})
                </span>
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent className="px-4 pb-4 space-y-3">
              {paidTransactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                />
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  );
}
