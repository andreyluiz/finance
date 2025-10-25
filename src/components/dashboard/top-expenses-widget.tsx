"use client";

import { TrendingDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Transaction } from "@/db/schema";
import type { BillingPeriod } from "@/lib/utils/billing-period";
import { getTopExpenses } from "@/lib/utils/dashboard-calculations";

interface TopExpensesWidgetProps {
  transactions: Transaction[];
  billingPeriod: BillingPeriod;
  currency: string;
}

export function TopExpensesWidget({
  transactions,
  billingPeriod,
  currency,
}: TopExpensesWidgetProps) {
  const t = useTranslations("dashboard.topExpenses");

  const topExpenses = getTopExpenses(transactions, billingPeriod, 5);

  const totalExpenses = transactions
    .filter((t) => {
      if (t.type !== "expense") return false;
      const dueDate = new Date(t.dueDate);
      return (
        dueDate >= billingPeriod.startDate && dueDate < billingPeriod.endDate
      );
    })
    .reduce((sum, t) => sum + Number(t.value), 0);

  const maxValue = topExpenses.length > 0 ? Number(topExpenses[0].value) : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="col-span-4 md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{t("title")}</CardTitle>
        <TrendingDown className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {topExpenses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t("noExpenses")}
          </div>
        ) : (
          <div className="space-y-4">
            {topExpenses.map((expense, index) => {
              const percentage =
                totalExpenses > 0
                  ? (Number(expense.value) / totalExpenses) * 100
                  : 0;
              const barWidth =
                maxValue > 0 ? (Number(expense.value) / maxValue) * 100 : 0;

              return (
                <div key={expense.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium truncate max-w-[60%]">
                      {index + 1}. {expense.name}
                    </span>
                    <span className="text-muted-foreground">
                      {formatCurrency(Number(expense.value))}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-red-600 dark:bg-red-400 h-full rounded-full transition-all"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
