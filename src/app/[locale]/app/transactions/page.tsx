"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getTransactionsAction } from "@/actions/transaction-actions";
import { Header } from "@/components/header";
import { AddTransactionFab } from "@/components/transactions/add-transaction-fab";
import { BillingPeriodSelector } from "@/components/transactions/billing-period-selector";
import { BillingPeriodTotals } from "@/components/transactions/billing-period-totals";
import { PaymentSessionLauncher } from "@/components/transactions/payment-session/payment-session-launcher";
import { SpendingCategoriesList } from "@/components/transactions/spending/spending-categories-list";
import { TransactionList } from "@/components/transactions/transaction-list";
import { TransactionModal } from "@/components/transactions/transaction-modal";
import { H1 } from "@/components/ui/typography";
import { QUERY_KEYS } from "@/lib/react-query";
import {
  type BillingPeriod,
  getCurrentBillingPeriod,
} from "@/lib/utils/billing-period";
import { useTransactionStore } from "@/stores/transaction-store";

export default function TransactionsPage() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod | null>(
    null,
  );
  const [includePastOverdue, setIncludePastOverdue] = useState(true);
  const { showTransactionModal, setShowTransactionModal } =
    useTransactionStore();

  // Fetch all transactions
  const { data: transactions = [] } = useQuery({
    queryKey: QUERY_KEYS.transactions,
    queryFn: getTransactionsAction,
  });

  // Initialize to current billing period on mount
  useEffect(() => {
    setBillingPeriod(getCurrentBillingPeriod());
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <H1 className="mb-6 pb-2 border-b border-border">Transactions</H1>

        <div className="space-y-4">
          {/* Spending Categories */}

          <PaymentSessionLauncher
            transactions={transactions}
            billingPeriod={billingPeriod}
          />

          {/* Billing Period Selector */}
          {billingPeriod && (
            <BillingPeriodSelector
              period={billingPeriod}
              onPeriodChange={setBillingPeriod}
            />
          )}

          {/* Billing Period Totals */}
          {billingPeriod && (
            <BillingPeriodTotals
              transactions={transactions}
              billingPeriod={billingPeriod}
              includePastOverdue={includePastOverdue}
              onIncludePastOverdueChange={setIncludePastOverdue}
            />
          )}

          {/* Spending Categories */}
          <SpendingCategoriesList billingPeriod={billingPeriod} />

          {/* Transaction List */}
          <TransactionList
            billingPeriod={billingPeriod || undefined}
            showPastOverdue={includePastOverdue}
          />
        </div>
      </main>

      {/* Transaction Modal */}
      <TransactionModal
        open={showTransactionModal}
        onOpenChange={setShowTransactionModal}
      />

      {/* Floating Action Button */}
      <AddTransactionFab />
    </div>
  );
}
