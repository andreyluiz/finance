"use client";

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
      priority:
        priority === "very_high"
          ? "Very High"
          : priority === "very_low"
            ? "Very Low"
            : priority.charAt(0).toUpperCase() + priority.slice(1),
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
      label: "Very High",
      color: "hsl(0 72.2% 50.6%)",
    },
    high: {
      label: "High",
      color: "hsl(24.6 95% 53.1%)",
    },
    medium: {
      label: "Medium",
      color: "hsl(47.9 95.8% 53.1%)",
    },
    low: {
      label: "Low",
      color: "hsl(142.1 76.2% 36.3%)",
    },
    "very-low": {
      label: "Very Low",
      color: "hsl(221.2 83.2% 53.3%)",
    },
  };

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Expenses by Priority (This Month)</CardTitle>
      </CardHeader>
      <CardContent>
        {totalExpenses === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-20">
            No expenses this month
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
                            Priorities
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
