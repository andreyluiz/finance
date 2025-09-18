'use client';

import * as React from 'react';
import { useTransactions } from '@/hooks/use-transactions';
import Header from '@/components/app/Header';
import SummaryCards from '@/components/app/SummaryCards';
import TransactionForm from '@/components/app/TransactionForm';
import { TransactionTable } from '@/components/app/TransactionTable';
import { Card, CardContent } from '@/components/ui/card';
import { type Transaction } from '@/lib/types';

export default function Home() {
  const {
    transactions,
    addTransaction,
    updateTransaction,
    removeTransaction,
    resetTransactions,
    totals,
    loading,
  } = useTransactions();
  const [editingTransaction, setEditingTransaction] = React.useState<Transaction | null>(null);

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
  };

  const handleSaveTransaction = (data: Omit<Transaction, 'id' | 'dueDate'> & { dueDate: string }) => {
    const transactionData = { ...data, dueDate: new Date(data.dueDate) };

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, transactionData);
    } else {
      addTransaction(transactionData);
    }
    setEditingTransaction(null);
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header onReset={resetTransactions} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCards totals={totals} />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <TransactionForm
                key={editingTransaction?.id ?? 'new'}
                onSubmit={handleSaveTransaction}
                initialData={editingTransaction}
                onCancel={handleCancelEdit}
              />
            </div>
          </div>
          <div className="lg:col-span-2">
            <Card className="shadow-md">
              <CardContent className="p-0">
                <TransactionTable
                  transactions={transactions}
                  onEdit={handleEdit}
                  onDelete={removeTransaction}
                  loading={loading}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
