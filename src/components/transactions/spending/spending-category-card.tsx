"use client";

import { Card, CardContent } from "@/components/ui/card";

interface SpendingCategoryCardProps {
  category: {
    id: string;
    name: string;
    color: string;
    totalAmount: number;
  };
  onClick: () => void;
  currency?: string;
}

export function SpendingCategoryCard({
  category,
  onClick,
  currency = "CHF", // Default or passed prop
}: SpendingCategoryCardProps) {
  // Format currency helper if not available in utils
  const formattedAmount = new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(category.totalAmount);

  return (
    <Card
      className="cursor-pointer hover:bg-accent/50 transition-colors border-l-4 border-border"
      style={{ borderLeftColor: category.color }}
      onClick={onClick}
    >
      <CardContent className="p-4 flex flex-col justify-between h-full gap-2">
        <div className="font-medium text-sm truncate" title={category.name}>
          {category.name}
        </div>
        <div className="text-xl font-bold">{formattedAmount}</div>
      </CardContent>
    </Card>
  );
}
