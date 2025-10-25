"use client";

import { Calendar } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Transaction } from "@/db/schema";
import { getBillsDueThisWeek } from "@/lib/utils/dashboard-calculations";

interface BillsDueThisWeekCardProps {
  transactions: Transaction[];
  currency: string;
}

export function BillsDueThisWeekCard({
  transactions,
  currency,
}: BillsDueThisWeekCardProps) {
  const t = useTranslations("dashboard.billsDueThisWeek");

  const { today, tomorrow, thisWeek, total } =
    getBillsDueThisWeek(transactions);

  const totalCount = today.length + tomorrow.length + thisWeek.length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{t("title")}</CardTitle>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{totalCount}</div>
        <p className="text-xs text-muted-foreground">
          {formatCurrency(total)} {t("total")}
        </p>
        <div className="mt-4 space-y-2 text-sm">
          {today.length > 0 && (
            <div className="flex justify-between">
              <span className="text-destructive font-medium">{t("today")}</span>
              <span className="text-muted-foreground">{today.length}</span>
            </div>
          )}
          {tomorrow.length > 0 && (
            <div className="flex justify-between">
              <span className="text-orange-600 dark:text-orange-400 font-medium">
                {t("tomorrow")}
              </span>
              <span className="text-muted-foreground">{tomorrow.length}</span>
            </div>
          )}
          {thisWeek.length > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("thisWeek")}</span>
              <span className="text-muted-foreground">{thisWeek.length}</span>
            </div>
          )}
          {totalCount === 0 && (
            <div className="text-muted-foreground text-center py-2">
              {t("noBills")}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
