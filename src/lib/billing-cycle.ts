import { startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { type Transaction, type BillingCycle } from './types';
import { type Totals } from '@/hooks/use-transactions';

const BILLING_DAY_OF_MONTH = 10;

export function getBillingCycle(date: Date): BillingCycle {
  const referenceMonth = date.getMonth();
  const referenceYear = date.getFullYear();

  // The cycle for a month (e.g., October) starts on the 10th of that month
  // and ends on the 9th of the next month.
  const startDate = new Date(referenceYear, referenceMonth, BILLING_DAY_OF_MONTH);
  const endDate = new Date(
    startDate.getFullYear(),
    startDate.getMonth() + 1,
    BILLING_DAY_OF_MONTH
  );

  return { startDate, endDate };
}


export function getBillingCycleTotals(transactions: Transaction[]): Totals {
    return transactions.reduce((acc, t) => {
        const { currency, type, value, priority, paid } = t;

        if (!acc[currency]) {
          acc[currency] = { revenue: 0, expense: 0, balance: 0, veryHighPriorityTotal: 0, paidTotal: 0, balanceAfterCritical: 0 };
        }
        
        if (type === 'receita') {
          acc[currency].revenue += value;
        } else {
          acc[currency].expense += value;
          if (priority === 'muito alta' && !paid) {
            acc[currency].veryHighPriorityTotal += value;
          }
        }
        
        if (type === 'receita' && paid) {
          acc[currency].paidTotal += value;
        } else if (type === 'despesa' && paid) {
          acc[currency].paidTotal += value;
        }

        acc[currency].balance = acc[currency].revenue - acc[currency].expense;
        // Corrected calculation: Subtract critical expenses from revenue, not from a balance that already includes them.
        acc[currency].balanceAfterCritical = acc[currency].revenue - (acc[currency].expense - acc[currency].veryHighPriorityTotal) - acc[currency].veryHighPriorityTotal;
        return acc;
      }, {} as Totals);
}
