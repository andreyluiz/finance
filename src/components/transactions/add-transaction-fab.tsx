"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTransactionStore } from "@/stores/transaction-store";

export function AddTransactionFab() {
  const { setShowTransactionModal } = useTransactionStore();

  return (
    <Button
      size="icon"
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
      onClick={() => setShowTransactionModal(true)}
      aria-label="Add transaction"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}
