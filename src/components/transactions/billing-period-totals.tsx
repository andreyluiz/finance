"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { getSpendingCategoryTotalsAction } from "@/actions/spending-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { Transaction } from "@/db/schema";
import type { BillingPeriod } from "@/lib/utils/billing-period";

interface BillingPeriodTotalsProps {
  transactions: Transaction[];
  billingPeriod: BillingPeriod;
  includePastOverdue: boolean;
  onIncludePastOverdueChange: (checked: boolean) => void;
}

export function BillingPeriodTotals({
  transactions,
  billingPeriod,
  includePastOverdue,
  onIncludePastOverdueChange,
}: BillingPeriodTotalsProps) {
  const t = useTranslations("transactions.billingPeriodTotals");
  const tSpending = useTranslations("spending");

  // Fetch spending category totals
  const { data: spendingCategories = [] } = useQuery({
    queryKey: [
      "spendingCategoriesTotals",
      billingPeriod.startDate,
      billingPeriod.endDate,
    ],
    queryFn: async () => {
      return await getSpendingCategoryTotalsAction(
        billingPeriod.startDate,
        billingPeriod.endDate,
      );
    },
  });

  const totalSpending = spendingCategories.reduce(
    (sum, cat) => sum + cat.totalAmount,
    0,
  );

  // Calculate totals for current period
  const currentPeriodIncome = transactions
    .filter(
      (t) =>
        t.type === "income" &&
        new Date(t.dueDate) >= billingPeriod.startDate &&
        new Date(t.dueDate) < billingPeriod.endDate,
    )
    .reduce((sum, t) => sum + Number(t.value), 0);

  const currentPeriodExpenses = transactions
    .filter(
      (t) =>
        t.type === "expense" &&
        new Date(t.dueDate) >= billingPeriod.startDate &&
        new Date(t.dueDate) < billingPeriod.endDate,
    )
    .reduce((sum, t) => sum + Number(t.value), 0);

  // Calculate overdue expenses from past periods
  const pastOverdueExpenses = transactions
    .filter(
      (t) =>
        t.type === "expense" &&
        !t.paid &&
        new Date(t.dueDate) < billingPeriod.startDate,
    )
    .reduce((sum, t) => sum + Number(t.value), 0);

  // Total expenses with spending categories
  const totalExpenses =
    (includePastOverdue
      ? currentPeriodExpenses + pastOverdueExpenses
      : currentPeriodExpenses) + totalSpending;

  // Balance calculation
  const balance = currentPeriodIncome - totalExpenses;

  // Determine currency (use first transaction's currency or default to USD)
  const currency = transactions[0]?.currency || "USD";

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <Card>
      <CardContent className="px-4">
        {/* Toggle for past overdue */}
        <div className="flex items-center justify-between py-3 border-b border-border">
          <Label
            htmlFor="include-past-overdue"
            className="text-sm font-medium cursor-pointer"
          >
            {t("includePastOverdue")}
          </Label>
          <Switch
            id="include-past-overdue"
            checked={includePastOverdue}
            onCheckedChange={onIncludePastOverdueChange}
          />
        </div>

        {/* Totals Grid */}
        <div className="grid md:grid-cols-3 grid-cols-2 gap-4 py-4">
          {/* Income */}
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              {t("income")}
            </div>
            <div className="text-xl font-semibold text-green-600 dark:text-green-400">
              {formatCurrency(currentPeriodIncome)}
            </div>
          </div>

          {/* Expenses */}
          <div className="space-y-1 md:text-center text-right">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              {t("expenses")}
            </div>
            <div className="text-xl font-semibold text-red-600 dark:text-red-400">
              {formatCurrency(totalExpenses)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t("current")}: {formatCurrency(currentPeriodExpenses)}
              {includePastOverdue && pastOverdueExpenses > 0 && (
                <>
                  <br />
                  {t("overdue")}: {formatCurrency(pastOverdueExpenses)}
                </>
              )}
              {totalSpending > 0 && (
                <>
                  <br />
                  {tSpending("categoriesLabel")}:{" "}
                  {formatCurrency(totalSpending)}
                </>
              )}
            </div>
          </div>

          {/* Balance */}
          <div className="space-y-1 md:col-span-1 col-span-2 text-right md:text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              {t("balance")}
            </div>
            <div
              className={`text-xl font-semibold ${
                balance >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {formatCurrency(balance)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
