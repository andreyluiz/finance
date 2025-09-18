'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Totals } from '@/hooks/use-transactions';

interface SummaryCardsProps {
  totals: Totals;
}

function formatCurrency(value: number, currency: string) {
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value);
  } catch (error) {
    return `${value.toFixed(2)} ${currency}`;
  }
}

export default function SummaryCards({ totals }: SummaryCardsProps) {
  const currencies = Object.keys(totals);

  if (currencies.length === 0) {
    return (
        <>
            <Card className="shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Receitas Totais</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">R$0,00</div>
                </CardContent>
            </Card>
            <Card className="shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
                    <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">R$0,00</div>
                </CardContent>
            </Card>
            <Card className="shadow-md md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Saldo</CardTitle>
                    <Scale className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">R$0,00</div>
                </CardContent>
            </Card>
        </>
    );
  }

  return (
    <>
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receitas Totais</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          {currencies.map((currency) => (
            <div key={currency} className="text-2xl font-bold text-green-600 dark:text-green-500">
              {formatCurrency(totals[currency].revenue, currency)}
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          {currencies.map((currency) => (
            <div key={currency} className="text-2xl font-bold text-red-600 dark:text-red-500">
              {formatCurrency(totals[currency].expense, currency)}
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="shadow-md md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo</CardTitle>
          <Scale className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {currencies.map((currency) => {
            const balance = totals[currency].balance;
            return (
              <div
                key={currency}
                className={cn(
                  'text-2xl font-bold',
                  balance >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
                )}
              >
                {formatCurrency(balance, currency)}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </>
  );
}
