'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Minus,
  ArrowUpCircle,
  ArrowDownCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Priority, Transaction, TransactionType, BillingCycle } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format, isToday, isTomorrow, isPast, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Checkbox } from '../ui/checkbox';

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  onTogglePaid: (id: string) => void;
  loading: boolean;
  billingCycle?: BillingCycle;
}

const priorityIcons: Record<Priority, React.ReactElement> = {
  'muito alta': <ArrowUpCircle className="h-5 w-5 text-red-500" />,
  'alta': <ArrowUp className="h-5 w-5 text-orange-500" />,
  'média': <Minus className="h-5 w-5 text-yellow-500" />,
  'baixa': <ArrowDown className="h-5 w-5 text-blue-500" />,
  'muito baixa': <ArrowDownCircle className="h-5 w-5 text-green-500" />,
};

const priorityText: Record<Priority, string> = {
    'muito alta': 'Muito Alta',
    'alta': 'Alta',
    'média': 'Média',
    'baixa': 'Baixa',
    'muito baixa': 'Muito Baixa',
  };

const typeVariant: Record<TransactionType, 'destructive' | 'secondary'> = {
  'despesa': 'destructive',
  'receita': 'secondary',
};

const typeText: Record<TransactionType, string> = {
  'despesa': 'Despesa',
  'receita': 'Receita',
};

function formatCurrency(value: number, currency: string) {
    try {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value);
    } catch (error) {
      return `${value.toFixed(2)} ${currency}`;
    }
  }

const DueDateInfo: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
    const { dueDate, paid, type } = transaction;
  
    const formattedDate = format(dueDate, 'dd/MM/yyyy', { locale: ptBR });

    if (paid) {
      return <span className="line-through text-muted-foreground">{formattedDate}</span>;
    }
  
    // Only show special badges for expenses
    if (type === 'despesa') {
        if (isToday(dueDate)) {
            return <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">Vence Hoje</Badge>;
        }
        if (isTomorrow(dueDate)) {
            return <Badge className="bg-orange-500 text-white hover:bg-orange-600">Vence Amanhã</Badge>;
        }
        if (isPast(dueDate)) {
            return (
                <div className="flex flex-col items-start gap-1">
                    <span>{formattedDate}</span>
                    <Badge variant="destructive">Vencida</Badge>
                </div>
            );
        }
    }

    return <span>{formattedDate}</span>;
  };


export function TransactionTable({ transactions, onEdit, onDelete, onTogglePaid, loading, billingCycle }: TransactionTableProps) {
  if (loading) {
    return <div className="flex items-center justify-center p-8">Carregando transações...</div>;
  }
  
  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Pago</TableHead>
            <TableHead className="w-[100px]">Tipo</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Prioridade</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="w-[50px] text-right print:hidden">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length > 0 ? (
            transactions.map((transaction) => {
              const isOverdue = !transaction.paid && isPast(transaction.dueDate);
              const isVeryOverdue = isOverdue && differenceInDays(new Date(), transaction.dueDate) > 30;
              const isCarriedOver = billingCycle && transaction.dueDate < billingCycle.startDate;

              return (
              <TableRow
                key={transaction.id}
                className={cn(
                  'transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
                  transaction.paid && 'bg-green-100/50 dark:bg-green-900/20',
                  isVeryOverdue && 'bg-red-100/50 dark:bg-red-900/20',
                  isCarriedOver && !transaction.paid && 'bg-yellow-100/50 dark:bg-yellow-900/20'
                )}
              >
                <TableCell>
                  <Checkbox
                    checked={transaction.paid}
                    onCheckedChange={() => onTogglePaid(transaction.id)}
                    aria-label={transaction.paid ? 'Marcar como não pago' : 'Marcar como pago'}
                  />
                </TableCell>
                <TableCell>
                  <Badge variant={typeVariant[transaction.type]}>{typeText[transaction.type]}</Badge>
                </TableCell>
                <TableCell className={cn("font-medium", transaction.paid && 'line-through text-muted-foreground')}>
                  {transaction.name}
                </TableCell>
                <TableCell>
                  <DueDateInfo transaction={transaction} />
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-2">
                        {priorityIcons[transaction.priority]}
                        <span className="hidden md:inline">{priorityText[transaction.priority]}</span>
                    </div>
                </TableCell>
                <TableCell
                  className={cn(
                    'text-right font-semibold',
                    transaction.type === 'receita' ? 'text-green-600' : 'text-red-600',
                    transaction.paid && 'line-through text-muted-foreground'
                  )}
                >
                  {transaction.type === 'receita' ? '+' : '-'} {formatCurrency(transaction.value, transaction.currency)}
                </TableCell>
                <TableCell className="text-right print:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(transaction)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(transaction)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Nenhuma transação encontrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
