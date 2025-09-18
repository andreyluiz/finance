'use client';

import * as React from 'react';
import { Wallet, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onReset: () => void;
}

export default function Header({ onReset }: HeaderProps) {
  return (
    <header className={cn("sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6", "print:hidden")}>
      <div className="flex items-center gap-2">
        <Wallet className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold tracking-tight">Rastreio Financeiro Simplificado</h1>
      </div>
      <div className="ml-auto">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente todos os seus dados de transação do
                armazenamento local do seu navegador.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={onReset}>Continuar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </header>
  );
}
