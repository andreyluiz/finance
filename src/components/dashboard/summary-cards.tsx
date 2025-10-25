"use client";

import {
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  DollarSign,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Transaction } from "@/db/schema";
import { cn } from "@/lib/utils";
import { getCurrentBillingPeriod } from "@/lib/utils/billing-period";

interface SummaryCardsProps {
  transactions: Transaction[];
}

export function SummaryCards({ transactions }: SummaryCardsProps) {
  const t = useTranslations("dashboard.summaryCards");

  // Get current billing period
  const billingPeriod = getCurrentBillingPeriod();

  // Calculate current billing period totals
  const currentPeriodTransactions = transactions.filter((t) => {
    const dueDate = new Date(t.dueDate);
    return (
      dueDate >= billingPeriod.startDate && dueDate < billingPeriod.endDate
    );
  });

  const totalIncome = currentPeriodTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.value), 0);

  const totalExpenses = currentPeriodTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.value), 0);

  const balance = totalIncome - totalExpenses;

  // Format billing period for display
  const formatPeriod = () => {
    const startMonth = billingPeriod.startDate.toLocaleDateString("en-US", {
      month: "short",
    });
    const startDay = billingPeriod.startDate.getDate();
    const endMonth = billingPeriod.endDate.toLocaleDateString("en-US", {
      month: "short",
    });
    const endDay = billingPeriod.endDate.getDate();
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
  };

  // Calculate overdue (expenses only)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueCount = transactions.filter((t) => {
    const dueDate = new Date(t.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return !t.paid && dueDate < today && t.type === "expense";
  }).length;

  const overdueAmount = transactions
    .filter((t) => {
      const dueDate = new Date(t.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return !t.paid && dueDate < today && t.type === "expense";
    })
    .reduce((sum, t) => sum + Number(t.value), 0);

  const currency = transactions[0]?.currency || "USD";

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Income Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex flex-col space-y-1">
            <CardTitle className="text-sm font-medium">
              {t("incomeThisPeriod")}
            </CardTitle>
            <p className="text-xs text-muted-foreground">{formatPeriod()}</p>
          </div>
          <ArrowUpCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(totalIncome)}
          </div>
          <p className="text-xs text-muted-foreground">
            {
              currentPeriodTransactions.filter((t) => t.type === "income")
                .length
            }{" "}
            {t("transactions")}
          </p>
        </CardContent>
      </Card>

      {/* Expenses Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex flex-col space-y-1">
            <CardTitle className="text-sm font-medium">
              {t("expensesThisPeriod")}
            </CardTitle>
            <p className="text-xs text-muted-foreground">{formatPeriod()}</p>
          </div>
          <ArrowDownCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(totalExpenses)}
          </div>
          <p className="text-xs text-muted-foreground">
            {
              currentPeriodTransactions.filter((t) => t.type === "expense")
                .length
            }{" "}
            {t("transactions")}
          </p>
        </CardContent>
      </Card>

      {/* Balance Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex flex-col space-y-1">
            <CardTitle className="text-sm font-medium">
              {t("balanceThisPeriod")}
            </CardTitle>
            <p className="text-xs text-muted-foreground">{formatPeriod()}</p>
          </div>
          <DollarSign
            className={cn(
              "h-4 w-4",
              balance >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400",
            )}
          />
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "text-2xl font-bold",
              balance >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400",
            )}
          >
            {formatCurrency(balance)}
          </div>
          <p className="text-xs text-muted-foreground">
            {balance >= 0 ? t("positive") : t("negative")} {t("cashFlow")}
          </p>
        </CardContent>
      </Card>

      {/* Overdue Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("overdue")}</CardTitle>
          <AlertCircle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            {overdueCount}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(overdueAmount)} {t("total")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
