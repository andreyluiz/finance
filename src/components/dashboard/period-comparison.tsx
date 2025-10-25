"use client";

import { ArrowDown, ArrowUp, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Transaction } from "@/db/schema";
import { cn } from "@/lib/utils";
import type { BillingPeriod } from "@/lib/utils/billing-period";
import { comparePeriods } from "@/lib/utils/dashboard-calculations";

interface PeriodComparisonProps {
  transactions: Transaction[];
  currentPeriod: BillingPeriod;
  previousPeriod: BillingPeriod;
  currency: string;
}

export function PeriodComparison({
  transactions,
  currentPeriod,
  previousPeriod,
  currency,
}: PeriodComparisonProps) {
  const t = useTranslations("dashboard.periodComparison");

  const comparison = comparePeriods(
    transactions,
    currentPeriod,
    previousPeriod,
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    const abs = Math.abs(value);
    return `${abs.toFixed(1)}%`;
  };

  const ComparisonRow = ({
    label,
    current,
    change,
    isPositiveGood = true,
  }: {
    label: string;
    current: number;
    change: { amount: number; percentage: number };
    isPositiveGood?: boolean;
  }) => {
    const isIncrease = change.amount > 0;
    const isGood = isPositiveGood ? isIncrease : !isIncrease;

    return (
      <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
        <div className="flex-1">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(current)}
          </p>
        </div>
        <div
          className={cn(
            "flex items-center gap-1 text-sm font-medium",
            isGood
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400",
          )}
        >
          {isIncrease ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )}
          <span>{formatPercentage(change.percentage)}</span>
        </div>
      </div>
    );
  };

  return (
    <Card className="col-span-4 md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{t("title")}</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-4">
          {t("comparedToPrevious")}
        </p>
        <div className="space-y-0">
          <ComparisonRow
            label={t("income")}
            current={comparison.current.income}
            change={comparison.changes.income}
            isPositiveGood={true}
          />
          <ComparisonRow
            label={t("expenses")}
            current={comparison.current.expenses}
            change={comparison.changes.expenses}
            isPositiveGood={false}
          />
          <ComparisonRow
            label={t("balance")}
            current={comparison.current.balance}
            change={comparison.changes.balance}
            isPositiveGood={true}
          />
        </div>
      </CardContent>
    </Card>
  );
}
