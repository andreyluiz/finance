"use client";

import { CheckCircle, Loader2, QrCodeIcon, SkipForward } from "lucide-react";
import { useTranslations } from "next-intl";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import {
  PRIORITY_BADGE_CLASSNAMES,
  TYPE_BADGE_CLASSNAMES,
} from "@/components/transactions/transaction-badge-variants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Muted } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { formatAmount } from "./payment-session-utils";
import type { SessionTransaction } from "./types";

interface SessionRunnerStepProps {
  transaction: SessionTransaction;
  index: number;
  total: number;
  onMarkPaid: () => Promise<void>;
  onSkip: () => void;
  isProcessing: boolean;
}

export function SessionRunnerStep({
  transaction,
  index,
  total,
  onMarkPaid,
  onSkip,
  isProcessing,
}: SessionRunnerStepProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);

  const dueDate = new Date(transaction.dueDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const t = useTranslations("transactions.paymentSession.runner");
  const tPriority = useTranslations("transactions.priority");
  const tStatus = useTranslations("transactions.status");

  // Generate QR code when payment reference is available
  useEffect(() => {
    if (transaction.paymentReference) {
      QRCode.toDataURL(transaction.paymentReference, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })
        .then((url) => {
          setQrCodeDataUrl(url);
        })
        .catch((error) => {
          console.error("Error generating QR code:", error);
          setQrCodeDataUrl(null);
        });
    } else {
      setQrCodeDataUrl(null);
    }
  }, [transaction.paymentReference]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Muted className="text-sm uppercase tracking-wide">
          {t("transactionProgress", { current: index + 1, total })}
        </Muted>
        <h3 className="text-2xl font-semibold">{transaction.name}</h3>
        <p className="text-muted-foreground">{t("reviewDescription")}</p>
      </div>

      <Card className="border-border p-6 space-y-4">
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
          {transaction.installmentNumber && (
            <Badge variant="outline">
              {t("installment", { number: transaction.installmentNumber })}
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{t("amount")}</p>
          <p className="text-3xl font-semibold text-red-600 dark:text-red-400">
            {formatAmount(Number(transaction.value), transaction.currency)}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {t("dueDate")}
            </p>
            <p className="text-sm font-semibold">{dueDate}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {t("currency")}
            </p>
            <p className="text-sm font-semibold">{transaction.currency}</p>
          </div>
        </div>
      </Card>

      {transaction.paymentReference && qrCodeDataUrl && (
        <Card className="border-border p-6 space-y-4">
          <div className="flex items-center gap-2">
            <QrCodeIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h4 className="font-semibold">{t("paymentReference")}</h4>
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border-blue-500 dark:border-blue-600"
            >
              {t("swissQRBill")}
            </Badge>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="bg-white p-4 rounded-lg border-2 border-border">
              {/* biome-ignore lint/performance/noImgElement: QR code is a data URL generated client-side, not an optimizable external image */}
              <img
                src={qrCodeDataUrl}
                alt="Payment QR Code"
                className="w-[300px] h-[300px]"
              />
            </div>
            <div className="w-full space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide text-center">
                {t("scanInstructions")}
              </p>
              <div className="rounded-lg border border-border bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  {t("reference")}
                </p>
                <p className="text-xs font-mono break-all mt-1">
                  {transaction.paymentReference.substring(0, 100)}
                  {transaction.paymentReference.length > 100 ? "..." : ""}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onSkip}
          disabled={isProcessing}
          className="sm:w-[180px]"
        >
          <SkipForward className="mr-2 h-4 w-4" />
          {t("skip")}
        </Button>
        <Button
          type="button"
          onClick={onMarkPaid}
          disabled={isProcessing}
          className={cn("sm:w-[220px]", isProcessing ? "opacity-90" : "")}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("updating")}
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              {t("markAsPaid")}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
