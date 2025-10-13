import { create } from "zustand";
import type { Transaction } from "@/db/schema";

interface TransactionStore {
  editingTransaction: Transaction | null;
  isEditMode: boolean;
  setEditingTransaction: (transaction: Transaction | null) => void;
  clearEditMode: () => void;
}

export const useTransactionStore = create<TransactionStore>((set) => ({
  editingTransaction: null,
  isEditMode: false,
  setEditingTransaction: (transaction) =>
    set({
      editingTransaction: transaction,
      isEditMode: !!transaction,
    }),
  clearEditMode: () =>
    set({
      editingTransaction: null,
      isEditMode: false,
    }),
}));
