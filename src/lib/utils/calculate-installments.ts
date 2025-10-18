export interface InstallmentBreakdown {
  installmentNumber: number;
  dueDate: Date;
  value: number;
}

export interface CalculateInstallmentsParams {
  totalValue: number;
  startDate: Date;
  installmentCount: number;
}

/**
 * Calculates the breakdown of installments for a monthly payment plan
 * @param totalValue - The total value to be split into installments
 * @param startDate - The date of the first installment
 * @param installmentCount - The number of installments to create
 * @returns An array of installment breakdowns with dates and values
 */
export function calculateInstallments({
  totalValue,
  startDate,
  installmentCount,
}: CalculateInstallmentsParams): InstallmentBreakdown[] {
  // Calculate value per installment (rounded to 2 decimal places)
  const valuePerInstallment =
    Math.round((totalValue / installmentCount) * 100) / 100;

  // Calculate remaining amount after evenly splitting (to handle rounding)
  const totalDistributed = valuePerInstallment * installmentCount;
  const remainder = Math.round((totalValue - totalDistributed) * 100) / 100;

  const installments: InstallmentBreakdown[] = [];

  for (let i = 0; i < installmentCount; i++) {
    // Calculate due date by adding months to start date
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);

    // Handle edge case where day doesn't exist in target month (e.g., Jan 31 -> Feb 28)
    // If we wanted Jan 31, but target month has fewer days, use last day of that month
    if (dueDate.getDate() !== startDate.getDate()) {
      // Day rolled over to next month, so go back to last day of intended month
      dueDate.setDate(0);
    }

    // Add remainder to last installment to ensure total matches exactly
    const installmentValue =
      i === installmentCount - 1
        ? valuePerInstallment + remainder
        : valuePerInstallment;

    installments.push({
      installmentNumber: i + 1,
      dueDate,
      value: installmentValue,
    });
  }

  return installments;
}

/**
 * Formats a value as currency
 * @param value - The numeric value to format
 * @param currency - The currency code (e.g., 'USD', 'EUR')
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formats a date as a readable string
 * @param date - The date to format
 * @returns Formatted date string
 */
export function formatInstallmentDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}
