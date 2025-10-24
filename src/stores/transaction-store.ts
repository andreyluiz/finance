import { create } from "zustand";
import type { Transaction } from "@/db/schema";

interface TransactionStore {
  editingTransaction: Transaction | null;
  isEditMode: boolean;
  showTransactionModal: boolean;
  setEditingTransaction: (transaction: Transaction | null) => void;
  clearEditMode: () => void;
  setShowTransactionModal: (show: boolean) => void;
}

export const useTransactionStore = create<TransactionStore>((set) => ({
  editingTransaction: null,
  isEditMode: false,
  showTransactionModal: false,
  setEditingTransaction: (transaction) =>
    set({
      editingTransaction: transaction,
      isEditMode: !!transaction,
      showTransactionModal: !!transaction,
    }),
  clearEditMode: () =>
    set({
      editingTransaction: null,
      isEditMode: false,
    }),
  setShowTransactionModal: (show) =>
    set({
      showTransactionModal: show,
      ...(!show && {
        editingTransaction: null,
        isEditMode: false,
      }),
    }),
}));
