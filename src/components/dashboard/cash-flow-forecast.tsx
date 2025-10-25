"use client";

import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { Transaction } from "@/db/schema";
import { projectCashFlow } from "@/lib/utils/dashboard-calculations";

interface CashFlowForecastProps {
  transactions: Transaction[];
  currentBalance: number;
  currency: string;
}

export function CashFlowForecast({
  transactions,
  currentBalance,
  currency,
}: CashFlowForecastProps) {
  const t = useTranslations("dashboard.cashFlowForecast");
  const [forecastDays, setForecastDays] = useState<30 | 90>(30);

  const projection = projectCashFlow(
    transactions,
    currentBalance,
    forecastDays,
  );

  // Check if balance goes negative
  const goesNegative = projection.some((p) => p.projectedBalance < 0);
  const minBalance = Math.min(...projection.map((p) => p.projectedBalance));

  // Format data for chart
  const chartData = projection.map((p) => ({
    date: p.date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    balance: p.projectedBalance,
  }));

  const chartConfig = {
    balance: {
      label: t("balance"),
      color: goesNegative ? "hsl(0 72.2% 50.6%)" : "hsl(142.1 76.2% 36.3%)",
    },
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">{t("title")}</CardTitle>
          {goesNegative && (
            <p className="text-xs text-destructive flex items-center gap-1 mt-1">
              <AlertTriangle className="h-3 w-3" />
              {t("warning")}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={forecastDays === 30 ? "default" : "outline"}
            size="sm"
            onClick={() => setForecastDays(30)}
          >
            {t("30days")}
          </Button>
          <Button
            variant={forecastDays === 90 ? "default" : "outline"}
            size="sm"
            onClick={() => setForecastDays(90)}
          >
            {t("90days")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">{t("currentBalance")}</p>
            <p className="text-lg font-semibold">
              {formatCurrency(currentBalance)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">{t("projected")}</p>
            <p
              className={`text-lg font-semibold ${
                minBalance < 0 ? "text-destructive" : ""
              }`}
            >
              {formatCurrency(
                projection[projection.length - 1].projectedBalance,
              )}
            </p>
          </div>
        </div>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <LineChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              interval={forecastDays === 30 ? 4 : 14}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => [
                    formatCurrency(Number(value)),
                    t("balance"),
                  ]}
                />
              }
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="var(--color-balance)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
