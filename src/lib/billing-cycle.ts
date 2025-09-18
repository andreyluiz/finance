import { startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { type Transaction, type BillingCycle } from './types';
import { type Totals } from '@/hooks/use-transactions';

const BILLING_DAY_OF_MONTH = 10;

export function getBillingCycle(date: Date): BillingCycle {
    const currentMonth = date.getMonth();
    const currentYear = date.getFullYear();
  
    // The start date is the 10th of the previous month.
    const startDate = new Date(currentYear, currentMonth - 1, BILLING_DAY_OF_MONTH);
    
    // The end date is the 10th of the current month (exclusive, so it includes up to the 9th).
    const endDate = new Date(currentYear, currentMonth, BILLING_DAY_OF_MONTH);
  
    return { startDate, endDate };
}

export function getBillingCycleTotals(transactions: Transaction[]): Totals {
    return transactions.reduce((acc, t) => {
        const { currency, type, value } = t;
        if (!acc[currency]) {
          acc[currency] = { revenue: 0, expense: 0, balance: 0 };
        }
        if (type === 'receita') {
          acc[currency].revenue += value;
        } else {
          acc[currency].expense += value;
        }
        acc[currency].balance = acc[currency].revenue - acc[currency].expense;
        return acc;
      }, {} as Totals);
}
