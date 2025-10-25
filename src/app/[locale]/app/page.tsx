"use client";

import { useQuery } from "@tanstack/react-query";
import { getTransactionsAction } from "@/actions/transaction-actions";
import { BillsDueThisWeekCard } from "@/components/dashboard/bills-due-this-week-card";
import { CashFlowForecast } from "@/components/dashboard/cash-flow-forecast";
import { ExpenseBreakdown } from "@/components/dashboard/expense-breakdown";
import { IncomeExpenseChart } from "@/components/dashboard/income-expense-chart";
import { InstallmentPlansOverview } from "@/components/dashboard/installment-plans-overview";
import { PaymentBurndownChart } from "@/components/dashboard/payment-burndown-chart";
import { PaymentPerformanceCard } from "@/components/dashboard/payment-performance-card";
import { PeriodComparison } from "@/components/dashboard/period-comparison";
import { SavingsRateCard } from "@/components/dashboard/savings-rate-card";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { TopExpensesWidget } from "@/components/dashboard/top-expenses-widget";
import { UpcomingPayments } from "@/components/dashboard/upcoming-payments";
import { Header } from "@/components/header";
import { H1 } from "@/components/ui/typography";
import { QUERY_KEYS } from "@/lib/react-query";
import {
  getCurrentBillingPeriod,
  getPreviousBillingPeriod,
} from "@/lib/utils/billing-period";

export default function AppPage() {
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.transactions,
    queryFn: getTransactionsAction,
  });

  const currentPeriod = getCurrentBillingPeriod();
  const previousPeriod = getPreviousBillingPeriod(currentPeriod);

  // Calculate current balance
  const currentPeriodIncome = transactions
    .filter((t) => {
      if (t.type !== "income") return false;
      const dueDate = new Date(t.dueDate);
      return (
        dueDate >= currentPeriod.startDate && dueDate < currentPeriod.endDate
      );
    })
    .reduce((sum, t) => sum + Number(t.value), 0);

  const currentPeriodExpenses = transactions
    .filter((t) => {
      if (t.type !== "expense") return false;
      const dueDate = new Date(t.dueDate);
      return (
        dueDate >= currentPeriod.startDate && dueDate < currentPeriod.endDate
      );
    })
    .reduce((sum, t) => sum + Number(t.value), 0);

  const currentBalance = currentPeriodIncome - currentPeriodExpenses;
  const currency = transactions[0]?.currency || "USD";

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
          <div className="space-y-4">
            {/* Summary Cards Row */}
            <SummaryCards transactions={transactions} />

            {/* Quick Stats Row */}
            <div className="grid gap-4 md:grid-cols-3">
              <SavingsRateCard
                income={currentPeriodIncome}
                expenses={currentPeriodExpenses}
              />
              <PaymentPerformanceCard transactions={transactions} />
              <BillsDueThisWeekCard
                transactions={transactions}
                currency={currency}
              />
            </div>

            {/* Cash Flow Forecast */}
            <CashFlowForecast
              transactions={transactions}
              currentBalance={currentBalance}
              currency={currency}
            />

            {/* Charts Grid */}
            <div className="grid gap-6 md:grid-cols-4 grid-cols-1">
              <IncomeExpenseChart transactions={transactions} />
              <PaymentBurndownChart transactions={transactions} />
            </div>

            {/* Analytics Grid */}
            <div className="grid gap-6 md:grid-cols-4">
              <TopExpensesWidget
                transactions={transactions}
                billingPeriod={currentPeriod}
                currency={currency}
              />
              <InstallmentPlansOverview
                transactions={transactions}
                currency={currency}
              />
            </div>

            {/* Comparison Grid */}
            <div className="grid gap-6 md:grid-cols-4 grid-cols-1">
              <PeriodComparison
                transactions={transactions}
                currentPeriod={currentPeriod}
                previousPeriod={previousPeriod}
                currency={currency}
              />
              <ExpenseBreakdown transactions={transactions} />
            </div>

            {/* Upcoming Payments */}
            <div className="grid gap-6 md:grid-cols-4">
              <UpcomingPayments transactions={transactions} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
