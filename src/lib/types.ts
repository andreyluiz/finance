export const priorities = ['muito alta', 'alta', 'média', 'baixa', 'muito baixa'] as const;
export type Priority = (typeof priorities)[number];

export const transactionTypes = ['receita', 'despesa'] as const;
export type TransactionType = (typeof transactionTypes)[number];

export const recurrenceTypes = ['one-time', 'monthly'] as const;
export type RecurrenceType = (typeof recurrenceTypes)[number];

export interface Transaction {
  id: string;
  type: TransactionType;
  name: string;
  value: number;
  currency: string;
  dueDate: Date;
  priority: Priority;
  recurrence: RecurrenceType;
  installments: number;
}

export interface BillingCycle {
  startDate: Date;
  endDate: Date;
}
