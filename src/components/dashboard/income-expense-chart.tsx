"use client";

import { useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { Transaction } from "@/db/schema";

interface IncomeExpenseChartProps {
  transactions: Transaction[];
}

export function IncomeExpenseChart({ transactions }: IncomeExpenseChartProps) {
  const t = useTranslations("dashboard.incomeExpenseChart");

  // Get last 6 months of data
  const months: {
    month: string;
    income: number;
    expenses: number;
  }[] = [];

  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleDateString("en-US", { month: "short" });

    const monthTransactions = transactions.filter((t) => {
      const dueDate = new Date(t.dueDate);
      return (
        dueDate.getMonth() === date.getMonth() &&
        dueDate.getFullYear() === date.getFullYear()
      );
    });

    const income = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.value), 0);

    const expenses = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.value), 0);

    months.push({
      month: monthName,
      income,
      expenses,
    });
  }

  const chartConfig = {
    income: {
      label: t("income"),
      color: "hsl(142.1 76.2% 36.3%)",
    },
    expenses: {
      label: t("expenses"),
      color: "hsl(0 72.2% 50.6%)",
    },
  };

  return (
    <Card className="col-span-full md:col-span-2">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <BarChart data={months}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="income" fill="var(--color-income)" radius={4} />
            <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
