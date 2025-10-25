"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { calculateSavingsRate } from "@/lib/utils/dashboard-calculations";

interface SavingsRateCardProps {
  income: number;
  expenses: number;
}

export function SavingsRateCard({ income, expenses }: SavingsRateCardProps) {
  const t = useTranslations("dashboard.savingsRate");

  const savingsRate = calculateSavingsRate(income, expenses);
  const isPositive = savingsRate > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{t("title")}</CardTitle>
        {isPositive ? (
          <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
        )}
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "text-2xl font-bold",
            isPositive
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400",
          )}
        >
          {savingsRate.toFixed(1)}%
        </div>
        <p className="text-xs text-muted-foreground">
          {isPositive ? t("saving") : t("overspending")}
        </p>
      </CardContent>
    </Card>
  );
}
