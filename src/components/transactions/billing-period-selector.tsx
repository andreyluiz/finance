"use client";

import { CalendarCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
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
  getCurrentBillingPeriod,
  getNextBillingPeriod,
  getPreviousBillingPeriod,
  isCurrentBillingPeriod,
} from "@/lib/utils/billing-period";

interface BillingPeriodSelectorProps {
  period: BillingPeriod;
  onPeriodChange: (period: BillingPeriod) => void;
}

// Generate years: 5 years in the past to 2 years in the future
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 8 }, (_, i) => currentYear - 5 + i);

export function BillingPeriodSelector({
  period,
  onPeriodChange,
}: BillingPeriodSelectorProps) {
  const t = useTranslations("transactions.billingPeriod");
  const tMonths = useTranslations("months");

  const MONTHS = [
    tMonths("january"),
    tMonths("february"),
    tMonths("march"),
    tMonths("april"),
    tMonths("may"),
    tMonths("june"),
    tMonths("july"),
    tMonths("august"),
    tMonths("september"),
    tMonths("october"),
    tMonths("november"),
    tMonths("december"),
  ];

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

  const handleGoToCurrent = () => {
    onPeriodChange(getCurrentBillingPeriod());
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border border-border bg-card">
      {/* Period Display */}
      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <span className="text-sm font-medium">{t("title")}</span>
          <span className="text-lg font-semibold">
            {formatBillingPeriod(period)}
          </span>
          {isCurrent && (
            <span className="text-xs text-muted-foreground">
              {t("currentPeriod")}
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
          aria-label={t("previous")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Month Selector */}
        <Select
          value={period.month.toString()}
          onValueChange={handleMonthChange}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder={t("selectMonth")} />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((month, index) => (
              <SelectItem key={month} value={index.toString()}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Year Selector */}
        <Select value={period.year.toString()} onValueChange={handleYearChange}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder={t("selectYear")} />
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
          aria-label={t("next")}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Go to Current Period Button */}
        {!isCurrent && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleGoToCurrent}
            className="gap-2"
          >
            <CalendarCheck className="h-4 w-4" />
            {t("goToCurrent")}
          </Button>
        )}
      </div>
    </div>
  );
}
