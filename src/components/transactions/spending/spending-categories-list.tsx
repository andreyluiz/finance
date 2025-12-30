"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { getSpendingCategoryTotalsAction } from "@/actions/spending-actions";
import { SettingsModal } from "@/components/settings/settings-modal"; // Might trigger settings from here? Or just show empty state.
import { SpendingCategoryCard } from "@/components/transactions/spending/spending-category-card";
import { SpendingCategoryDetails } from "@/components/transactions/spending/spending-category-details";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { SpendingCategory } from "@/db/schema";
import type { BillingPeriod } from "@/lib/utils/billing-period";

interface SpendingCategoriesListProps {
  billingPeriod: BillingPeriod | null;
}

export function SpendingCategoriesList({
  billingPeriod,
}: SpendingCategoriesListProps) {
  const [selectedCategory, setSelectedCategory] = useState<{
    id: string;
    name: string;
    color: string;
  } | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Fetch totals
  const { data: categories = [], isLoading } = useQuery({
    queryKey: [
      "spendingCategoriesTotals",
      billingPeriod?.startDate,
      billingPeriod?.endDate,
    ],
    queryFn: async () => {
      if (!billingPeriod) return [];
      return await getSpendingCategoryTotalsAction(
        billingPeriod.startDate,
        billingPeriod.endDate,
      );
    },
    enabled: !!billingPeriod,
  });

  const handleCategoryClick = (category: (typeof categories)[0]) => {
    setSelectedCategory(category);
    setDetailsOpen(true);
  };

  if (!billingPeriod) return null;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    // Optional: Show prompt to create categories?
    return null;
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
        {categories.map(
          (category: {
            id: string;
            name: string;
            color: string;
            totalAmount: number;
          }) => (
            <SpendingCategoryCard
              key={category.id}
              category={category}
              onClick={() => handleCategoryClick(category)}
            />
          ),
        )}
      </div>

      {selectedCategory && (
        <SpendingCategoryDetails
          category={selectedCategory as SpendingCategory} // Casting because we only need id/name/color mostly, but type matches structure
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          billingPeriod={billingPeriod}
        />
      )}
    </>
  );
}
