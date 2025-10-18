"use client";

import { Calendar, DollarSign } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Transaction } from "@/db/schema";

interface UpcomingPaymentsProps {
  transactions: Transaction[];
}

export function UpcomingPayments({ transactions }: UpcomingPaymentsProps) {
  // Get upcoming payments (unpaid, due in the next 7 days)
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const sevenDaysFromNow = new Date(now);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const upcomingPayments = transactions
    .filter((t) => {
      const dueDate = new Date(t.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return !t.paid && dueDate >= now && dueDate <= sevenDaysFromNow;
    })
    .sort((a, b) => {
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 5); // Show only top 5

  const currency = transactions[0]?.currency || "USD";

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getDaysUntil = (date: Date) => {
    const dueDate = new Date(date);
    dueDate.setHours(0, 0, 0, 0);
    const diff = Math.ceil((dueDate.getTime() - now.getTime()) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    return `${diff} days`;
  };

  const typeVariants = {
    income: {
      label: "Income",
      className:
        "bg-green-50 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-400 dark:border-green-700",
    },
    expense: {
      label: "Expense",
      className:
        "bg-red-50 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-400 dark:border-red-700",
    },
  };

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Upcoming Payments (Next 7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingPayments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No upcoming payments in the next 7 days
          </p>
        ) : (
          <div className="space-y-4">
            {upcomingPayments.map((payment, index) => (
              <div key={payment.id}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium">{payment.name}</p>
                      <Badge
                        variant="outline"
                        className={typeVariants[payment.type].className}
                      >
                        {typeVariants[payment.type].label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(payment.dueDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {formatCurrency(Number(payment.value))}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-muted-foreground">
                      {getDaysUntil(payment.dueDate)}
                    </p>
                  </div>
                </div>
                {index < upcomingPayments.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}

            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/app/transactions">View All Transactions</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
