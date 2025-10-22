"use client";

import { CheckCircle2, ListChecks, SkipForward } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Muted } from "@/components/ui/typography";
import { formatAmount } from "./payment-session-utils";
import type { SessionResult } from "./types";

interface SessionSummaryStepProps {
  results: SessionResult;
  currency: string;
  onClose: () => void;
  isClosing: boolean;
}

export function SessionSummaryStep({
  results,
  currency,
  onClose,
  isClosing,
}: SessionSummaryStepProps) {
  const t = useTranslations("transactions.paymentSession.summary");

  const paidTotal = results.paid.reduce(
    (sum, transaction) => sum + Number(transaction.value),
    0,
  );
  const skippedTotal = results.skipped.reduce(
    (sum, transaction) => sum + Number(transaction.value),
    0,
  );
  const totalProcessed = results.paid.length + results.skipped.length;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <ListChecks className="h-10 w-10 text-primary" />
        <h3 className="text-2xl font-semibold">{t("title")}</h3>
        <Muted>{t("description")}</Muted>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-border p-4 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <p className="text-sm font-semibold">{t("paid")}</p>
          </div>
          <p className="text-3xl font-semibold">
            {formatAmount(paidTotal, currency)}
          </p>
          <Muted>
            {results.paid.length} {t("transactions")}
          </Muted>
        </Card>

        <Card className="border-border p-4 space-y-2">
          <div className="flex items-center gap-2">
            <SkipForward className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm font-semibold">{t("skipped")}</p>
          </div>
          <p className="text-3xl font-semibold">
            {formatAmount(skippedTotal, currency)}
          </p>
          <Muted>
            {results.skipped.length} {t("transactions")}
          </Muted>
        </Card>
      </div>

      <Card className="border-border p-4 space-y-2">
        <p className="text-sm text-muted-foreground">{t("summaryTitle")}</p>
        <p className="text-lg font-semibold">
          {t("reviewed", { count: totalProcessed })}
        </p>
        <Muted>{t("summaryDescription")}</Muted>
      </Card>

      <Button
        onClick={onClose}
        disabled={isClosing}
        className="w-full sm:w-auto"
      >
        {isClosing ? t("updating") : t("closeSession")}
      </Button>
    </div>
  );
}
