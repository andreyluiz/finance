'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { type Transaction, type Priority } from '@/lib/types';
import { useToast } from './use-toast';

const LOCAL_STORAGE_KEY = 'financial_transactions';

const priorityOrder: Record<Priority, number> = {
  'muito alta': 5,
  'alta': 4,
  'média': 3,
  'baixa': 2,
  'muito baixa': 1,
};

export interface Totals {
  [currency: string]: {
    revenue: number;
    expense: number;
    balance: number;
  };
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedTransactions = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedTransactions) {
        const parsed = JSON.parse(storedTransactions).map((t: any) => ({
          ...t,
          dueDate: new Date(t.dueDate),
        }));
        setTransactions(parsed);
      }
    } catch (error) {
      console.error('Failed to load transactions from localStorage', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar suas transações.',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const persistTransactions = useCallback(
    (newTransactions: Transaction[]) => {
      try {
        setTransactions(newTransactions);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newTransactions));
      } catch (error) {
        console.error('Failed to save transactions to localStorage', error);
        toast({
          variant: 'destructive',
          title: 'Erro ao salvar dados',
          description: 'Não foi possível salvar suas transações.',
        });
      }
    },
    [toast]
  );

  const scheduleNotification = useCallback((transaction: Transaction) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }
    const now = new Date();
    const dueDate = transaction.dueDate;

    const notify = (title: string, body: string, time: Date) => {
      const delay = time.getTime() - now.getTime();
      if (delay > 0) {
        setTimeout(() => {
          new Notification(title, { body });
        }, delay);
      }
    };
    
    // Reminder for tomorrow
    const tomorrowReminderTime = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate() - 1, 12, 0, 0);
    if(tomorrowReminderTime > now) {
      notify('Lembrete de despesa', `Vence amanhã: ${transaction.name} - ${transaction.value}`, tomorrowReminderTime);
    }

    // Reminder for today
    const todayReminderTime = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate(), 8, 0, 0);
     if(todayReminderTime > now) {
      notify('Lembrete de despesa', `Vence hoje: ${transaction.name} - ${transaction.value}`, todayReminderTime);
    }
  }, []);

  const addTransaction = useCallback(
    (transaction: Omit<Transaction, 'id'>) => {
      const newTransaction = { ...transaction, id: crypto.randomUUID() };
      const newTransactions = [...transactions, newTransaction];
      persistTransactions(newTransactions);
      toast({ title: 'Transação adicionada', description: `'${newTransaction.name}' foi adicionado.` });
      if (newTransaction.type === 'despesa') {
        scheduleNotification(newTransaction);
      }
    },
    [transactions, persistTransactions, scheduleNotification, toast]
  );

  const updateTransaction = useCallback(
    (id: string, updatedTransaction: Partial<Omit<Transaction, 'id'>>) => {
      const newTransactions = transactions.map((t) =>
        t.id === id ? { ...t, ...updatedTransaction } : t
      );
      persistTransactions(newTransactions);
      toast({ title: 'Transação atualizada', description: 'Suas alterações foram salvas.' });
    },
    [transactions, persistTransactions, toast]
  );

  const removeTransaction = useCallback(
    (id: string) => {
      const newTransactions = transactions.filter((t) => t.id !== id);
      persistTransactions(newTransactions);
      toast({ title: 'Transação removida', variant: 'destructive' });
    },
    [transactions, persistTransactions, toast]
  );

  const resetTransactions = useCallback(() => {
    persistTransactions([]);
    toast({ title: 'Dados resetados', description: 'Todas as transações foram apagadas.' });
  }, [persistTransactions, toast]);

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      const dateDiff = a.dueDate.getTime() - b.dueDate.getTime();
      if (dateDiff !== 0) return dateDiff;

      return b.value - a.value;
    });
  }, [transactions]);

  const totals = useMemo<Totals>(() => {
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
  }, [transactions]);

  return {
    transactions: sortedTransactions,
    addTransaction,
    updateTransaction,
    removeTransaction,
    resetTransactions,
    totals,
    loading,
  };
};
