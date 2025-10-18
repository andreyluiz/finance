"use client";

import { useQuery } from "@tanstack/react-query";
import { getTransactionsAction } from "@/actions/transaction-actions";
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
}

export function TransactionList({
  className,
  billingPeriod,
}: TransactionListProps) {
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

  if (isLoading) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center p-8">
          <Muted>Loading transactions...</Muted>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center p-8">
          <Muted className="text-destructive">
            Error loading transactions. Please try again.
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
              ? "No transactions for this billing period."
              : "No transactions yet."}
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
        {filteredTransactions.map((transaction) => (
          <TransactionCard key={transaction.id} transaction={transaction} />
        ))}
      </div>
    </div>
  );
}
