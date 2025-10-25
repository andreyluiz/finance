"use client";

import { useTranslations } from "next-intl";
import { Label, Pie, PieChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { Transaction } from "@/db/schema";

interface ExpenseBreakdownProps {
  transactions: Transaction[];
}

export function ExpenseBreakdown({ transactions }: ExpenseBreakdownProps) {
  const t = useTranslations("dashboard.expenseBreakdown");
  const tPriority = useTranslations("transactions.priority");

  // Get current month expenses grouped by priority
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthExpenses = transactions.filter((t) => {
    const dueDate = new Date(t.dueDate);
    return (
      t.type === "expense" &&
      dueDate.getMonth() === currentMonth &&
      dueDate.getFullYear() === currentYear
    );
  });

  // Group by priority
  const priorityMap = new Map<string, number>();
  currentMonthExpenses.forEach((t) => {
    const priority = t.priority;
    const current = priorityMap.get(priority) || 0;
    priorityMap.set(priority, current + Number(t.value));
  });

  const chartData = Array.from(priorityMap.entries()).map(
    ([priority, value]) => ({
      priority: tPriority(
        priority as "very_high" | "high" | "medium" | "low" | "very_low",
      ),
      value: Number(value.toFixed(2)),
      fill: `var(--color-${priority.replace("_", "-")})`,
    }),
  );

  const totalExpenses = chartData.reduce((sum, item) => sum + item.value, 0);

  const chartConfig = {
    value: {
      label: "Amount",
    },
    "very-high": {
      label: tPriority("very_high"),
      color: "hsl(0 72.2% 50.6%)",
    },
    high: {
      label: tPriority("high"),
      color: "hsl(24.6 95% 53.1%)",
    },
    medium: {
      label: tPriority("medium"),
      color: "hsl(47.9 95.8% 53.1%)",
    },
    low: {
      label: tPriority("low"),
      color: "hsl(142.1 76.2% 36.3%)",
    },
    "very-low": {
      label: tPriority("very_low"),
      color: "hsl(221.2 83.2% 53.3%)",
    },
  };

  return (
    <Card className="col-span-4 md:col-span-2">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {totalExpenses === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-20">
            {t("noExpenses")}
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="priority"
                innerRadius={60}
                strokeWidth={5}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {chartData.length}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            {t("priorities")}
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
