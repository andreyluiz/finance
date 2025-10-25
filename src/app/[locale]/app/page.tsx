"use client";

import { useQuery } from "@tanstack/react-query";
import { getTransactionsAction } from "@/actions/transaction-actions";
import { ExpenseBreakdown } from "@/components/dashboard/expense-breakdown";
import { IncomeExpenseChart } from "@/components/dashboard/income-expense-chart";
import { PaymentBurndownChart } from "@/components/dashboard/payment-burndown-chart";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { UpcomingPayments } from "@/components/dashboard/upcoming-payments";
import { Header } from "@/components/header";
import { H1 } from "@/components/ui/typography";
import { QUERY_KEYS } from "@/lib/react-query";

export default function AppPage() {
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.transactions,
    queryFn: getTransactionsAction,
  });

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <H1 className="mb-6">Dashboard</H1>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <SummaryCards transactions={transactions} />

            {/* Charts Grid */}
            <div className="grid gap-6 md:grid-cols-7">
              <IncomeExpenseChart transactions={transactions} />
              <ExpenseBreakdown transactions={transactions} />
            </div>

            {/* Payment Burndown Chart */}
            <div className="grid gap-6 md:grid-cols-7">
              <PaymentBurndownChart transactions={transactions} />
            </div>

            {/* Upcoming Payments */}
            <div className="grid gap-6 md:grid-cols-7">
              <UpcomingPayments transactions={transactions} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
