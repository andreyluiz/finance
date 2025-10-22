"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Edit2Icon, QrCodeIcon, TrashIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { memo, useState } from "react";
import { toast } from "sonner";
import {
  deleteTransactionAction,
  updateTransactionPaidAction,
} from "@/actions/transaction-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Muted } from "@/components/ui/typography";
import type { Transaction } from "@/db/schema";
import { QUERY_KEYS } from "@/lib/react-query";
import { cn } from "@/lib/utils";
import { useTransactionStore } from "@/stores/transaction-store";
import {
  PRIORITY_BADGE_CLASSNAMES,
  TYPE_BADGE_CLASSNAMES,
} from "./transaction-badge-variants";

interface TransactionCardProps {
  transaction: Transaction;
}

export const TransactionCard = memo(function TransactionCard({
  transaction,
}: TransactionCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { setEditingTransaction } = useTransactionStore();
  const queryClient = useQueryClient();
  const t = useTranslations("transactions.card");
  const tPriority = useTranslations("transactions.priority");
  const tStatus = useTranslations("transactions.status");
  const tSuccess = useTranslations("transactions.success");
  const tErrors = useTranslations("transactions.errors");

  // Helper functions for date checking
  const isOverdue = () => {
    if (transaction.paid) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(transaction.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const isDueToday = () => {
    if (transaction.paid) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(transaction.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  };

  const overdue = isOverdue();
  const dueToday = isDueToday();

  const handleEdit = () => {
    setEditingTransaction(transaction);
  };

  const handleDelete = async () => {
    if (!confirm(t("deleteConfirm"))) {
      return;
    }

    setIsDeleting(true);

    try {
      const result = await deleteTransactionAction(transaction.id);

      if (result.success) {
        toast.success(tSuccess("deleted"));
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });
      } else {
        toast.error(result.error || tErrors("deleteFailed"));
      }
    } catch (_error) {
      toast.error(tErrors("unexpected"));
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePaidToggle = async (checked: boolean) => {
    // Optimistic update
    queryClient.setQueryData(
      QUERY_KEYS.transactions,
      (old: Transaction[] = []) => {
        return old.map((t) =>
          t.id === transaction.id ? { ...t, paid: checked } : t,
        );
      },
    );

    try {
      const result = await updateTransactionPaidAction(transaction.id, checked);

      if (result.success) {
        toast.success(
          checked ? tSuccess("markedPaid") : tSuccess("markedUnpaid"),
        );
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });
      } else {
        // Rollback on error
        queryClient.setQueryData(
          QUERY_KEYS.transactions,
          (old: Transaction[] = []) => {
            return old.map((t) =>
              t.id === transaction.id ? { ...t, paid: !checked } : t,
            );
          },
        );
        toast.error(result.error || tErrors("updatePaidFailed"));
      }
    } catch (_error) {
      // Rollback on error
      queryClient.setQueryData(
        QUERY_KEYS.transactions,
        (old: Transaction[] = []) => {
          return old.map((t) =>
            t.id === transaction.id ? { ...t, paid: !checked } : t,
          );
        },
      );
      toast.error(tErrors("unexpected"));
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

  // Determine card styling based on status
  const cardClassName = cn({
    "border-destructive bg-destructive/5": overdue,
    "border-yellow-500 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-950/20":
      dueToday,
  });

  return (
    <Card className={cardClassName}>
      <CardContent className="px-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left side - Main info */}
          <div className="flex-1 flex items-start gap-3">
            <Checkbox
              checked={transaction.paid}
              onCheckedChange={handlePaidToggle}
              aria-label={
                transaction.paid ? t("markAsUnpaid") : t("markAsPaid")
              }
              className="mt-0.5"
            />
            <div className="flex-1 space-y-2">
              <h3
                className={`font-semibold ${transaction.paid ? "line-through text-muted-foreground" : ""}`}
              >
                {transaction.name}
              </h3>

              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={TYPE_BADGE_CLASSNAMES[transaction.type]}
                >
                  {tStatus(transaction.type)}
                </Badge>
                <Badge
                  variant="outline"
                  className={PRIORITY_BADGE_CLASSNAMES[transaction.priority]}
                >
                  {tPriority(transaction.priority)}
                </Badge>
                {transaction.paid && (
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400"
                  >
                    {t("paid")}
                  </Badge>
                )}
                {overdue && (
                  <Badge variant="destructive" className="font-semibold">
                    {t("overdue")}
                  </Badge>
                )}
                {dueToday && (
                  <Badge
                    variant="outline"
                    className="bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-400 border-yellow-500 dark:border-yellow-600 font-semibold"
                  >
                    {t("dueToday")}
                  </Badge>
                )}
                {transaction.paymentReference && (
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border-blue-500 dark:border-blue-600"
                  >
                    <QrCodeIcon className="h-3 w-3" />
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4">
                <Muted
                  className={`font-medium ${
                    transaction.type === "income"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {transaction.currency} {Number(transaction.value).toFixed(2)}
                </Muted>
                <Muted
                  className={
                    overdue
                      ? "text-destructive font-semibold"
                      : dueToday
                        ? "text-yellow-700 dark:text-yellow-500 font-semibold"
                        : ""
                  }
                >
                  {t("due")}: {formattedDate}
                </Muted>
              </div>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleEdit}
              aria-label={t("editTransaction")}
            >
              <Edit2Icon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={isDeleting}
              aria-label={t("deleteTransaction")}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
