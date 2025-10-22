"use client";

import { AlertTriangle, CalendarDays, QrCodeIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  PRIORITY_BADGE_CLASSNAMES,
  TYPE_BADGE_CLASSNAMES,
} from "@/components/transactions/transaction-badge-variants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Muted } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { formatAmount } from "./payment-session-utils";
import type { SessionPeriodGroup, SessionTransaction } from "./types";

interface SessionSelectionStepProps {
  groups: SessionPeriodGroup[];
  selectedIds: Set<string>;
  selectedCount: number;
  selectedTotal: number;
  currentPeriodIncome: number;
  requiresWarning: boolean;
  warningAcknowledged: boolean;
  currency: string;
  onToggleTransaction: (transaction: SessionTransaction) => void;
  onAcknowledgeWarning: () => void;
  onContinue: () => void;
  onCancel: () => void;
}

export function SessionSelectionStep({
  groups,
  selectedIds,
  selectedCount,
  selectedTotal,
  currentPeriodIncome,
  requiresWarning,
  warningAcknowledged,
  currency,
  onToggleTransaction,
  onAcknowledgeWarning,
  onContinue,
  onCancel,
}: SessionSelectionStepProps) {
  const hasExpenses = groups.some((group) => group.transactions.length > 0);
  const canContinue =
    selectedCount > 0 && (!requiresWarning || warningAcknowledged);
  const tPriority = useTranslations("transactions.priority");
  const tStatus = useTranslations("transactions.status");
  const t = useTranslations("transactions.paymentSession.selection");

  if (!hasExpenses) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <CalendarDays className="h-10 w-10 text-muted-foreground" />
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold">{t("noExpenses")}</p>
          <Muted className="max-w-md">{t("noExpensesDescription")}</Muted>
        </div>
        <Button variant="outline" onClick={onCancel}>
          {t("close")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{t("title")}</h3>
        <Muted>{t("description")}</Muted>
      </div>

      <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
        {groups.map((group) => {
          if (group.transactions.length === 0) {
            return null;
          }

          return (
            <Card
              key={`${group.period.year}-${group.period.month}`}
              className="border-border p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-md font-semibold">{group.label}</h4>
                <span className="text-sm text-muted-foreground">
                  {group.transactions.length}{" "}
                  {group.transactions.length > 1
                    ? t("itemsPlural")
                    : t("items")}
                </span>
              </div>
              <Separator />
              <div className="space-y-3">
                {group.transactions.map((transaction) => {
                  const dueDate = new Date(
                    transaction.dueDate,
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  const checked = selectedIds.has(transaction.id);

                  return (
                    <button
                      key={transaction.id}
                      type="button"
                      className={cn(
                        "flex w-full flex-col gap-3 rounded-lg border border-border px-4 py-3 text-left transition-colors",
                        "sm:flex-row sm:items-center sm:justify-between",
                        "hover:border-primary/70 hover:bg-primary/5",
                        checked ? "border-primary bg-primary/10" : "",
                      )}
                      onClick={() => onToggleTransaction(transaction)}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() =>
                            onToggleTransaction(transaction)
                          }
                          onClick={(event) => event.stopPropagation()}
                          aria-label={`Select ${transaction.name}`}
                        />
                        <div className="space-y-1">
                          <p className="font-semibold leading-tight">
                            {transaction.name}
                          </p>
                          <Muted className="text-xs">Due {dueDate}</Muted>
                        </div>
                      </div>
                      <div className="flex w-full flex-col items-start gap-2 sm:w-auto sm:items-end">
                        <div className="flex flex-wrap gap-2 sm:justify-end">
                          <Badge
                            variant="outline"
                            className={TYPE_BADGE_CLASSNAMES[transaction.type]}
                          >
                            {tStatus(transaction.type)}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={
                              PRIORITY_BADGE_CLASSNAMES[transaction.priority]
                            }
                          >
                            {tPriority(transaction.priority)}
                          </Badge>
                          {transaction.paymentReference && (
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border-blue-500 dark:border-blue-600"
                            >
                              <QrCodeIcon className="h-3 w-3" />
                            </Badge>
                          )}
                        </div>
                        <p className="font-semibold text-red-600 dark:text-red-400">
                          {formatAmount(
                            Number(transaction.value),
                            transaction.currency,
                          )}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="border-border p-4 space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">
            {t("currentPeriodIncome")}
          </span>
          <span className="font-semibold">
            {formatAmount(currentPeriodIncome, currency)}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">{t("selectedExpenses")}</span>
          <span
            className={cn(
              "font-semibold",
              selectedTotal > currentPeriodIncome ? "text-destructive" : "",
            )}
          >
            {formatAmount(selectedTotal, currency)}
          </span>
        </div>

        {requiresWarning && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
            <div className="flex items-start gap-3 min-w-6">
              <AlertTriangle className="mt-0.5 h-12 w-12 text-destructive" />
              <div className="space-y-1">
                <p className="font-semibold text-destructive">
                  {t("warningTitle")}
                </p>
                <p className="text-muted-foreground">
                  {t("warningDescription")}
                </p>
              </div>
            </div>
            {!warningAcknowledged && (
              <Button
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10"
                onClick={(event) => {
                  event.stopPropagation();
                  onAcknowledgeWarning();
                }}
              >
                {t("acknowledgeWarning")}
              </Button>
            )}
          </div>
        )}
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          {t("cancel")}
        </Button>
        <Button onClick={onContinue} disabled={!canContinue}>
          {t("next")}
        </Button>
      </div>
    </div>
  );
}
