"use client";

import { Award, Clock, Target } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Transaction } from "@/db/schema";
import { calculatePaymentPerformance } from "@/lib/utils/dashboard-calculations";

interface PaymentPerformanceCardProps {
  transactions: Transaction[];
}

export function PaymentPerformanceCard({
  transactions,
}: PaymentPerformanceCardProps) {
  const t = useTranslations("dashboard.paymentPerformance");

  const performance = calculatePaymentPerformance(transactions);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{t("title")}</CardTitle>
        <Target className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {performance.onTimeRate.toFixed(1)}%
        </div>
        <p className="text-xs text-muted-foreground mb-4">{t("onTimeRate")}</p>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{t("avgDays")}</p>
              <p className="text-sm font-medium">
                {performance.averageDaysToPayment > 0 && "+"}
                {performance.averageDaysToPayment} {t("days")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{t("streak")}</p>
              <p className="text-sm font-medium">
                {performance.currentStreak} {t("payments")}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
