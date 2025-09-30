'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (deleteType: 'single' | 'future') => void;
}

export default function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
}: DeleteConfirmationDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Transação Recorrente</AlertDialogTitle>
          <AlertDialogDescription>
            Esta é uma transação recorrente. Você quer excluir apenas esta
            parcela ou esta e todas as futuras?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-start gap-2">
          <Button onClick={() => onConfirm('single')} variant="destructive">
            Excluir somente esta
          </Button>
          <Button onClick={() => onConfirm('future')} variant="destructive">
            Excluir esta e as futuras
          </Button>
          <Button onClick={onClose} variant="outline">
            Cancelar
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
