"use client";

import { CreditCard } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Transaction } from "@/db/schema";

interface InstallmentPlansOverviewProps {
  transactions: Transaction[];
  currency: string;
}

interface InstallmentPlanSummary {
  id: string;
  name: string;
  totalInstallments: number;
  paidInstallments: number;
  totalRemaining: number;
  progress: number;
}

export function InstallmentPlansOverview({
  transactions,
  currency,
}: InstallmentPlansOverviewProps) {
  const t = useTranslations("dashboard.installmentPlans");

  // Group transactions by installment plan
  const planMap = new Map<string, InstallmentPlanSummary>();

  transactions.forEach((transaction) => {
    if (!transaction.installmentPlanId) return;

    const planId = transaction.installmentPlanId;
    const existing = planMap.get(planId);

    if (existing) {
      existing.totalInstallments++;
      if (transaction.paid) {
        existing.paidInstallments++;
      } else {
        existing.totalRemaining += Number(transaction.value);
      }
    } else {
      planMap.set(planId, {
        id: planId,
        name: transaction.name,
        totalInstallments: 1,
        paidInstallments: transaction.paid ? 1 : 0,
        totalRemaining: transaction.paid ? 0 : Number(transaction.value),
        progress: 0,
      });
    }
  });

  // Calculate progress for each plan
  const plans: InstallmentPlanSummary[] = Array.from(planMap.values()).map(
    (plan) => ({
      ...plan,
      progress: (plan.paidInstallments / plan.totalInstallments) * 100,
    }),
  );

  // Filter only active plans (not 100% complete)
  const activePlans = plans.filter((plan) => plan.progress < 100);

  const totalRemaining = activePlans.reduce(
    (sum, plan) => sum + plan.totalRemaining,
    0,
  );

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
        <CreditCard className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {activePlans.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t("noPlans")}
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(totalRemaining)}
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              {t("totalRemaining")}
            </p>
            <div className="space-y-4">
              {activePlans.slice(0, 3).map((plan) => (
                <div key={plan.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium truncate max-w-[60%]">
                      {plan.name}
                    </span>
                    <span className="text-muted-foreground">
                      {plan.paidInstallments}/{plan.totalInstallments}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 dark:bg-blue-400 h-full rounded-full transition-all"
                        style={{ width: `${plan.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {plan.progress.toFixed(0)}%
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(plan.totalRemaining)} {t("remaining")}
                  </div>
                </div>
              ))}
              {activePlans.length > 3 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  +{activePlans.length - 3} {t("morePlans")}
                </p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
