'use client';

import * as React from 'react';
import { useTransactions } from '@/hooks/use-transactions';
import Header from '@/components/app/Header';
import SummaryCards from '@/components/app/SummaryCards';
import TransactionForm from '@/components/app/TransactionForm';
import { TransactionTable } from '@/components/app/TransactionTable';
import { Card, CardContent } from '@/components/ui/card';
import { type Transaction } from '@/lib/types';
import { type FormValues } from '@/components/app/TransactionForm';
import BillingCycleSelector from '@/components/app/BillingCycleSelector';
import { getBillingCycle, getBillingCycleTotals } from '@/lib/billing-cycle';
import { subMonths } from 'date-fns';
import DeleteConfirmationDialog from '@/components/app/DeleteConfirmationDialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function Home() {
  const {
    transactions,
    addTransaction,
    updateTransaction,
    removeTransaction,
    removeFutureInstallments,
    resetTransactions,
    toggleTransactionPaid,
    loading,
  } = useTransactions();
  const [editingTransaction, setEditingTransaction] = React.useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = React.useState<Transaction | null>(null);
  const [formKey, setFormKey] = React.useState(Date.now());
  const [showOverdue, setShowOverdue] = React.useState(true);

  // If it's before the 10th, the default cycle should be the previous month.
  const initialDate = new Date().getDate() < 10 ? subMonths(new Date(), 1) : new Date();
  const [currentBillingMonth, setCurrentBillingMonth] = React.useState(initialDate);

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormKey(Date.now());
  };

  const handleDeleteRequest = (transaction: Transaction) => {
    if (transaction.installments && transaction.installments > 1) {
      setDeletingTransaction(transaction);
    } else {
      removeTransaction(transaction.id);
    }
  };

  const handleCancelDelete = () => {
    setDeletingTransaction(null);
  };

  const handleConfirmDelete = (deleteType: 'single' | 'future') => {
    if (deletingTransaction) {
      if (deleteType === 'single') {
        removeTransaction(deletingTransaction.id);
      } else {
        removeFutureInstallments(deletingTransaction.id);
      }
    }
    setDeletingTransaction(null);
  };


  const handleCancelEdit = () => {
    setEditingTransaction(null);
    setFormKey(Date.now());
  };

  const handleSaveTransaction = (data: FormValues) => {
    const transactionData = { ...data, dueDate: new Date(data.dueDate), installments: data.installments ?? 1 };

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, transactionData);
    } else {
      addTransaction(transactionData);
    }
    setEditingTransaction(null);
    setFormKey(Date.now());
  };

  const billingCycle = getBillingCycle(currentBillingMonth);

  const filteredTransactions = React.useMemo(() => {
    return transactions.filter((t) => {
      const isOverdue = t.type === 'despesa' && !t.paid && t.dueDate < billingCycle.startDate;
      const isInCycle = t.dueDate >= billingCycle.startDate && t.dueDate < billingCycle.endDate;
      
      if (showOverdue) {
        return isInCycle || isOverdue;
      }
      return isInCycle;
    });
  }, [transactions, billingCycle, showOverdue]);
  
  const billingCycleTotals = getBillingCycleTotals(filteredTransactions);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header onReset={resetTransactions} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <BillingCycleSelector
          currentBillingMonth={currentBillingMonth}
          onMonthChange={setCurrentBillingMonth}
        />
         <div className="flex items-center justify-center space-x-2 mb-4 print:hidden">
          <Switch id="show-overdue" checked={showOverdue} onCheckedChange={setShowOverdue} />
          <Label htmlFor="show-overdue">Mostrar contas vencidas de meses anteriores</Label>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <SummaryCards totals={billingCycleTotals} />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-1 print:hidden">
            <div className="sticky top-24">
              <TransactionForm
                key={formKey}
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
                  transactions={filteredTransactions}
                  onEdit={handleEdit}
                  onDelete={handleDeleteRequest}
                  onTogglePaid={toggleTransactionPaid}
                  loading={loading}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
       <DeleteConfirmationDialog
        isOpen={!!deletingTransaction}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
