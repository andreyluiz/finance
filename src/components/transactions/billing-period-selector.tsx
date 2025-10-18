"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type BillingPeriod,
  formatBillingPeriod,
  getBillingPeriod,
  getNextBillingPeriod,
  getPreviousBillingPeriod,
  isCurrentBillingPeriod,
} from "@/lib/utils/billing-period";

interface BillingPeriodSelectorProps {
  period: BillingPeriod;
  onPeriodChange: (period: BillingPeriod) => void;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Generate years: 5 years in the past to 2 years in the future
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 8 }, (_, i) => currentYear - 5 + i);

export function BillingPeriodSelector({
  period,
  onPeriodChange,
}: BillingPeriodSelectorProps) {
  const isCurrent = isCurrentBillingPeriod(period);

  const handlePrevious = () => {
    onPeriodChange(getPreviousBillingPeriod(period));
  };

  const handleNext = () => {
    onPeriodChange(getNextBillingPeriod(period));
  };

  const handleMonthChange = (monthIndex: string) => {
    const newPeriod = getBillingPeriod(
      period.year,
      Number.parseInt(monthIndex, 10),
    );
    onPeriodChange(newPeriod);
  };

  const handleYearChange = (year: string) => {
    const newPeriod = getBillingPeriod(Number.parseInt(year, 10), period.month);
    onPeriodChange(newPeriod);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border border-border bg-card">
      {/* Period Display */}
      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <span className="text-sm font-medium">Billing Period</span>
          <span className="text-lg font-semibold">
            {formatBillingPeriod(period)}
          </span>
          {isCurrent && (
            <span className="text-xs text-muted-foreground">
              (Current Period)
            </span>
          )}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          aria-label="Previous billing period"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Month Selector */}
        <Select
          value={period.month.toString()}
          onValueChange={handleMonthChange}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((month, index) => (
              <SelectItem key={index} value={index.toString()}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Year Selector */}
        <Select value={period.year.toString()} onValueChange={handleYearChange}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {YEARS.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Next Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          aria-label="Next billing period"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
