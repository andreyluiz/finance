"use client";

import { useQuery } from "@tanstack/react-query";
import { getTransactionsAction } from "@/actions/transaction-actions";
import { QUERY_KEYS } from "@/lib/react-query";
import { TransactionCard } from "./transaction-card";
import { Muted } from "@/components/ui/typography";

interface TransactionListProps {
  className?: string;
}

export function TransactionList({ className }: TransactionListProps) {
  const {
    data: transactions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.transactions,
    queryFn: getTransactionsAction,
  });

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

  if (transactions.length === 0) {
    return (
      <div className={className}>
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Muted>No transactions yet.</Muted>
          <Muted>Create your first transaction to get started!</Muted>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Transactions ({transactions.length})
          </h2>
        </div>
        {transactions.map((transaction) => (
          <TransactionCard key={transaction.id} transaction={transaction} />
        ))}
      </div>
    </div>
  );
}
