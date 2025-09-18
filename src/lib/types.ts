export const priorities = ['muito alta', 'alta', 'média', 'baixa', 'muito baixa'] as const;
export type Priority = (typeof priorities)[number];

export const transactionTypes = ['receita', 'despesa'] as const;
export type TransactionType = (typeof transactionTypes)[number];

export interface Transaction {
  id: string;
  type: TransactionType;
  name: string;
  value: number;
  currency: string;
  dueDate: Date;
  priority: Priority;
}
