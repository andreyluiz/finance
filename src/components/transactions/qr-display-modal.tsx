"use client";

import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useTranslations } from "next-intl";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { updateTransactionPaidAction } from "@/actions/transaction-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Muted } from "@/components/ui/typography";
import type { Transaction } from "@/db/schema";
import { QUERY_KEYS } from "@/lib/react-query";

interface QRDisplayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction;
}

export function QRDisplayModal({
  open,
  onOpenChange,
  transaction,
}: QRDisplayModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  const queryClient = useQueryClient();
  const t = useTranslations("transactions.qrDisplay");
  const tSuccess = useTranslations("transactions.success");
  const tErrors = useTranslations("transactions.errors");

  useEffect(() => {
    if (open && transaction.paymentReference) {
      setIsLoading(true);
      QRCode.toDataURL(transaction.paymentReference, {
        width: 300,
        margin: 2,
        errorCorrectionLevel: "M",
      })
        .then((url) => {
          setQrCodeUrl(url);
          setIsLoading(false);
        })
        .catch((_error) => {
          toast.error(t("errors.generateFailed"));
          setIsLoading(false);
        });
    }
  }, [open, transaction.paymentReference, t]);

  const handleMarkAsPaid = async () => {
    setIsMarkingPaid(true);

    // Optimistic update
    queryClient.setQueryData(
      QUERY_KEYS.transactions,
      (old: Transaction[] = []) => {
        return old.map((t) =>
          t.id === transaction.id ? { ...t, paid: true } : t,
        );
      },
    );

    try {
      const result = await updateTransactionPaidAction(transaction.id, true);

      if (result.success) {
        toast.success(tSuccess("markedPaid"));
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });
        onOpenChange(false);
      } else {
        // Rollback on error
        queryClient.setQueryData(
          QUERY_KEYS.transactions,
          (old: Transaction[] = []) => {
            return old.map((t) =>
              t.id === transaction.id ? { ...t, paid: false } : t,
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
            t.id === transaction.id ? { ...t, paid: false } : t,
          );
        },
      );
      toast.error(tErrors("unexpected"));
    } finally {
      setIsMarkingPaid(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Transaction Details */}
          <div className="space-y-2">
            <div>
              <Muted className="text-xs">{t("transactionName")}</Muted>
              <p className="font-semibold">{transaction.name}</p>
            </div>
            <div className="flex gap-4">
              <div>
                <Muted className="text-xs">{t("amount")}</Muted>
                <p className="font-semibold">
                  {transaction.currency} {Number(transaction.value).toFixed(2)}
                </p>
              </div>
              <div>
                <Muted className="text-xs">{t("dueDate")}</Muted>
                <p className="font-semibold">{formattedDate}</p>
              </div>
            </div>
            {transaction.paymentReferenceType && (
              <div>
                <Muted className="text-xs">{t("referenceType")}</Muted>
                <p className="font-semibold">
                  {transaction.paymentReferenceType === "SWISS_QR_BILL"
                    ? t("swissQRBill")
                    : transaction.paymentReferenceType}
                </p>
              </div>
            )}
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center justify-center space-y-2">
            {isLoading ? (
              <div className="w-[300px] h-[300px] bg-muted rounded-lg flex items-center justify-center">
                <Muted>{t("generating")}</Muted>
              </div>
            ) : qrCodeUrl ? (
              <>
                <Image
                  src={qrCodeUrl}
                  alt="QR Code"
                  width={300}
                  height={300}
                  className="w-[300px] h-[300px] border-2 border-border rounded-lg"
                />
                <Muted className="text-xs text-center max-w-[300px]">
                  {t("scanInstructions")}
                </Muted>
              </>
            ) : (
              <div className="w-[300px] h-[300px] bg-muted rounded-lg flex items-center justify-center">
                <Muted>{t("errors.noReference")}</Muted>
              </div>
            )}
          </div>

          {/* Payment Reference */}
          {transaction.paymentReference && (
            <div className="bg-muted p-3 rounded-lg">
              <Muted className="text-xs mb-1">{t("reference")}</Muted>
              <p className="text-xs font-mono break-all">
                {transaction.paymentReference}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            {t("close")}
          </Button>
          {!transaction.paid && (
            <Button
              type="button"
              onClick={handleMarkAsPaid}
              disabled={isMarkingPaid}
              className="w-full sm:w-auto"
            >
              {isMarkingPaid ? t("markingPaid") : t("markAsPaid")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
