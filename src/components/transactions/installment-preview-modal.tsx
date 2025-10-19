"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { InstallmentBreakdown } from "@/lib/utils/calculate-installments";
import {
  formatCurrency,
  formatInstallmentDate,
} from "@/lib/utils/calculate-installments";

interface InstallmentPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  installmentData: {
    name: string;
    totalValue: number;
    currency: string;
    installmentCount: number;
  };
  installments: InstallmentBreakdown[];
}

export function InstallmentPreviewModal({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting,
  installmentData,
  installments,
}: InstallmentPreviewModalProps) {
  const { name, totalValue, currency, installmentCount } = installmentData;
  const t = useTranslations("transactions.installmentPreview");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col border-border">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Summary Card */}
          <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{t("name")}:</span>
              <span className="text-sm">{name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{t("totalValue")}:</span>
              <span className="text-sm font-semibold">
                {formatCurrency(totalValue, currency)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{t("installments")}:</span>
              <span className="text-sm">{installmentCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{t("amount")}:</span>
              <span className="text-sm">
                {formatCurrency(installments[0]?.value || 0, currency)}
              </span>
            </div>
          </div>

          {/* Installments List */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">{t("breakdown")}</h4>
            <div className="rounded-lg border border-border">
              <div className="grid grid-cols-3 gap-4 p-3 bg-muted/30 border-b border-border font-medium text-sm">
                <div>{t("installment")}</div>
                <div>{t("dueDate")}</div>
                <div className="text-right">{t("amount")}</div>
              </div>
              <div className="divide-y max-h-[300px] overflow-y-auto">
                {installments.map((installment) => (
                  <div
                    key={installment.installmentNumber}
                    className="grid grid-cols-3 gap-4 p-3 text-sm hover:bg-muted/30 transition-colors border-border"
                  >
                    <div>
                      {installment.installmentNumber} of {installmentCount}
                    </div>
                    <div>{formatInstallmentDate(installment.dueDate)}</div>
                    <div className="text-right font-medium">
                      {formatCurrency(installment.value, currency)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {t("cancel")}
          </Button>
          <Button type="button" onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? t("creating") : t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
