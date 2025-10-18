const BILLING_PERIOD_DAY_KEY = "billingPeriodDay";

/**
 * Interface representing a billing period with start and end dates
 */
export interface BillingPeriod {
  startDate: Date;
  endDate: Date;
  month: number; // 0-11 (JavaScript month)
  year: number;
}

/**
 * Gets the configured billing period day from localStorage
 * @returns The billing day (1-31), defaults to last day of current month
 */
export function getBillingPeriodDay(): number {
  if (typeof window === "undefined") {
    return getLastDayOfCurrentMonth();
  }

  const stored = localStorage.getItem(BILLING_PERIOD_DAY_KEY);
  if (!stored) {
    return getLastDayOfCurrentMonth();
  }

  const day = Number.parseInt(stored, 10);
  if (Number.isNaN(day) || day < 1 || day > 31) {
    return getLastDayOfCurrentMonth();
  }

  return day;
}

/**
 * Sets the billing period day in localStorage
 * @param day - The billing day (1-31)
 */
export function setBillingPeriodDay(day: number): void {
  if (day < 1 || day > 31) {
    throw new Error("Billing period day must be between 1 and 31");
  }
  localStorage.setItem(BILLING_PERIOD_DAY_KEY, day.toString());
}

/**
 * Gets the last day of the current month
 * @returns The last day number of the current month
 */
function getLastDayOfCurrentMonth(): number {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return lastDay.getDate();
}

/**
 * Gets the actual day to use for a given month/year, handling edge cases
 * For example, if billing day is 31 but month only has 30 days, returns 30
 * @param billingDay - The configured billing day (1-31)
 * @param year - The year
 * @param month - The month (0-11)
 * @returns The actual day to use for this month
 */
function getActualDayForMonth(
  billingDay: number,
  year: number,
  month: number,
): number {
  // Get the last day of the target month
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  // Return the minimum of billing day and last day of month
  return Math.min(billingDay, lastDayOfMonth);
}

/**
 * Calculates the billing period for a given month and year
 * @param year - The year
 * @param month - The month (0-11)
 * @param billingDay - Optional billing day override (defaults to stored value)
 * @returns The billing period with start and end dates
 */
export function getBillingPeriod(
  year: number,
  month: number,
  billingDay?: number,
): BillingPeriod {
  const day = billingDay ?? getBillingPeriodDay();

  // Calculate the start date
  const startDay = getActualDayForMonth(day, year, month);
  const startDate = new Date(year, month, startDay);

  // Calculate the end date (next month, same day, exclusive)
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  const endDay = getActualDayForMonth(day, nextYear, nextMonth);
  const endDate = new Date(nextYear, nextMonth, endDay);

  return {
    startDate,
    endDate,
    month,
    year,
  };
}

/**
 * Gets the current billing period (the period that includes today's date)
 * @returns The current billing period
 */
export function getCurrentBillingPeriod(): BillingPeriod {
  const now = new Date();
  const billingDay = getBillingPeriodDay();

  // Check if today is before or after the billing day of current month
  const currentMonthBillingDay = getActualDayForMonth(
    billingDay,
    now.getFullYear(),
    now.getMonth(),
  );

  // If we're before the billing day, the current period started last month
  if (now.getDate() < currentMonthBillingDay) {
    const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const prevYear =
      now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    return getBillingPeriod(prevYear, prevMonth, billingDay);
  }

  // Otherwise, the current period started this month
  return getBillingPeriod(now.getFullYear(), now.getMonth(), billingDay);
}

/**
 * Gets the next billing period relative to the given period
 * @param period - The current billing period
 * @returns The next billing period
 */
export function getNextBillingPeriod(period: BillingPeriod): BillingPeriod {
  const nextMonth = period.month === 11 ? 0 : period.month + 1;
  const nextYear = period.month === 11 ? period.year + 1 : period.year;
  return getBillingPeriod(nextYear, nextMonth);
}

/**
 * Gets the previous billing period relative to the given period
 * @param period - The current billing period
 * @returns The previous billing period
 */
export function getPreviousBillingPeriod(period: BillingPeriod): BillingPeriod {
  const prevMonth = period.month === 0 ? 11 : period.month - 1;
  const prevYear = period.month === 0 ? period.year - 1 : period.year;
  return getBillingPeriod(prevYear, prevMonth);
}

/**
 * Formats a billing period as a readable string
 * @param period - The billing period to format
 * @returns Formatted string (e.g., "Jan 10 - Feb 10, 2025")
 */
export function formatBillingPeriod(period: BillingPeriod): string {
  const startMonth = period.startDate.toLocaleDateString("en-US", {
    month: "short",
  });
  const startDay = period.startDate.getDate();
  const endMonth = period.endDate.toLocaleDateString("en-US", {
    month: "short",
  });
  const endDay = period.endDate.getDate();
  const year = period.endDate.getFullYear();

  return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
}

/**
 * Checks if a date falls within a billing period
 * @param date - The date to check
 * @param period - The billing period
 * @returns True if the date is within the period (inclusive start, exclusive end)
 */
export function isDateInBillingPeriod(
  date: Date,
  period: BillingPeriod,
): boolean {
  return date >= period.startDate && date < period.endDate;
}

/**
 * Checks if the given billing period is the current period
 * @param period - The billing period to check
 * @returns True if this is the current billing period
 */
export function isCurrentBillingPeriod(period: BillingPeriod): boolean {
  const current = getCurrentBillingPeriod();
  return (
    period.month === current.month &&
    period.year === current.year &&
    period.startDate.getTime() === current.startDate.getTime()
  );
}
