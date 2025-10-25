"use client";

import { useTranslations } from "next-intl";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { Transaction } from "@/db/schema";

interface PaymentBurndownChartProps {
  transactions: Transaction[];
}

export function PaymentBurndownChart({
  transactions,
}: PaymentBurndownChartProps) {
  const t = useTranslations("dashboard.paymentBurndownChart");

  // Get last 6 months of data
  const months: {
    month: string;
    income: number;
    expenses: number;
    paid: number;
  }[] = [];

  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleDateString("en-US", { month: "short" });

    // Income and expenses based on due date (all transactions)
    const dueTransactions = transactions.filter((t) => {
      const dueDate = new Date(t.dueDate);
      return (
        dueDate.getMonth() === date.getMonth() &&
        dueDate.getFullYear() === date.getFullYear()
      );
    });

    const income = dueTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.value), 0);

    const expenses = dueTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.value), 0);

    // Payments actually made in this month (based on updatedAt for paid expenses)
    const paidTransactions = transactions.filter((t) => {
      if (!t.paid || t.type !== "expense") return false;

      const updatedDate = new Date(t.updatedAt);
      return (
        updatedDate.getMonth() === date.getMonth() &&
        updatedDate.getFullYear() === date.getFullYear()
      );
    });

    const paid = paidTransactions.reduce((sum, t) => sum + Number(t.value), 0);

    months.push({
      month: monthName,
      income,
      expenses,
      paid,
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
    paid: {
      label: t("paid"),
      color: "hsl(217.2 91.2% 59.8%)",
    },
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <LineChart data={months}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="income"
              stroke="var(--color-income)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="var(--color-expenses)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="paid"
              stroke="var(--color-paid)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
