"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Edit2Icon, TrashIcon } from "lucide-react";
import {
  deleteTransactionAction,
  updateTransactionPaidAction,
} from "@/actions/transaction-actions";
import type { Transaction } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Muted } from "@/components/ui/typography";
import { useTransactionStore } from "@/stores/transaction-store";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/react-query";

interface TransactionCardProps {
  transaction: Transaction;
}

const priorityVariants = {
  very_high: { label: "Very High", variant: "destructive" as const },
  high: { label: "High", variant: "destructive" as const },
  medium: { label: "Medium", variant: "default" as const },
  low: { label: "Low", variant: "secondary" as const },
  very_low: { label: "Very Low", variant: "secondary" as const },
};

const typeVariants = {
  income: { label: "Income", variant: "default" as const },
  expense: { label: "Expense", variant: "outline" as const },
};

export function TransactionCard({ transaction }: TransactionCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { setEditingTransaction } = useTransactionStore();
  const queryClient = useQueryClient();

  const handleEdit = () => {
    setEditingTransaction(transaction);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    setIsDeleting(true);

    try {
      const result = await deleteTransactionAction(transaction.id);

      if (result.success) {
        toast.success("Transaction deleted successfully");
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });
      } else {
        toast.error(result.error || "Failed to delete transaction");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePaidToggle = async (checked: boolean) => {
    // Optimistic update
    queryClient.setQueryData(QUERY_KEYS.transactions, (old: Transaction[] = []) => {
      return old.map((t) =>
        t.id === transaction.id ? { ...t, paid: checked } : t
      );
    });

    try {
      const result = await updateTransactionPaidAction(transaction.id, checked);

      if (result.success) {
        toast.success(
          checked
            ? "Transaction marked as paid"
            : "Transaction marked as unpaid",
        );
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });
      } else {
        // Rollback on error
        queryClient.setQueryData(QUERY_KEYS.transactions, (old: Transaction[] = []) => {
          return old.map((t) =>
            t.id === transaction.id ? { ...t, paid: !checked } : t
          );
        });
        toast.error(result.error || "Failed to update transaction");
      }
    } catch (error) {
      // Rollback on error
      queryClient.setQueryData(QUERY_KEYS.transactions, (old: Transaction[] = []) => {
        return old.map((t) =>
          t.id === transaction.id ? { ...t, paid: !checked } : t
        );
      });
      toast.error("An unexpected error occurred");
    }
  };

  const formattedDate = new Date(transaction.dueDate).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left side - Main info */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={transaction.paid}
                onCheckedChange={handlePaidToggle}
                aria-label={
                  transaction.paid
                    ? "Mark transaction as unpaid"
                    : "Mark transaction as paid"
                }
              />
              <h3
                className={`font-semibold ${transaction.paid ? "line-through text-muted-foreground" : ""}`}
              >
                {transaction.name}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={typeVariants[transaction.type].variant}>
                {typeVariants[transaction.type].label}
              </Badge>
              <Badge
                variant={priorityVariants[transaction.priority].variant}
              >
                {priorityVariants[transaction.priority].label}
              </Badge>
              {transaction.paid && (
                <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400">
                  Paid
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Muted className="font-medium">
                {transaction.currency} {Number(transaction.value).toFixed(2)}
              </Muted>
              <Muted>Due: {formattedDate}</Muted>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleEdit}
              aria-label="Edit transaction"
            >
              <Edit2Icon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={isDeleting}
              aria-label="Delete transaction"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
