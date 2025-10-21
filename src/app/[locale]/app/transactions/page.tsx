"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getTransactionsAction } from "@/actions/transaction-actions";
import { Header } from "@/components/header";
import { BillingPeriodSelector } from "@/components/transactions/billing-period-selector";
import { BillingPeriodTotals } from "@/components/transactions/billing-period-totals";
import { PaymentSessionLauncher } from "@/components/transactions/payment-session/payment-session-launcher";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { TransactionList } from "@/components/transactions/transaction-list";
import { H1 } from "@/components/ui/typography";
import { QUERY_KEYS } from "@/lib/react-query";
import {
  type BillingPeriod,
  getCurrentBillingPeriod,
} from "@/lib/utils/billing-period";

export default function TransactionsPage() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod | null>(
    null,
  );
  const [includePastOverdue, setIncludePastOverdue] = useState(true);

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

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Form: full width on mobile, 35% on desktop */}
          <div className="w-full lg:w-[35%]">
            <TransactionForm />
          </div>

          {/* List: full width on mobile, 65% on desktop */}
          <div className="w-full lg:w-[65%] space-y-4">
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

            {/* Transaction List */}
            <TransactionList
              billingPeriod={billingPeriod || undefined}
              showPastOverdue={includePastOverdue}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
