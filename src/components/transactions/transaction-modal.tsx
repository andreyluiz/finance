"use client";

import { ArrowLeft, FileText, QrCode } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTransactionStore } from "@/stores/transaction-store";
import { QRScannerStep } from "./qr-scanner-step";
import { TransactionForm } from "./transaction-form";

type ModalStep = "choice" | "form" | "qr-scanner";

interface TransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionModal({
  open,
  onOpenChange,
}: TransactionModalProps) {
  const [currentStep, setCurrentStep] = useState<ModalStep>("choice");
  const [qrData, setQrData] = useState<{
    name: string;
    value: number;
    currency: string;
    dueDate: Date | null;
    paymentReference: string;
    paymentReferenceType: string;
  } | null>(null);

  const { isEditMode } = useTransactionStore();
  const t = useTranslations("transactions.modal");

  // Reset state when modal closes
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setCurrentStep("choice");
      setQrData(null);
    }
    onOpenChange(nextOpen);
  };

  // When modal opens in edit mode, go directly to form
  const effectiveStep = isEditMode ? "form" : currentStep;

  const handleChoiceSelect = (choice: "form" | "qr-scanner") => {
    setCurrentStep(choice);
  };

  const handleQRScanSuccess = (data: {
    name: string;
    value: number;
    currency: string;
    dueDate: Date | null;
    paymentReference: string;
    paymentReferenceType: string;
  }) => {
    setQrData(data);
    setCurrentStep("form");
  };

  const handleBackToChoice = () => {
    setQrData(null);
    setCurrentStep("choice");
  };

  const renderStepContent = () => {
    switch (effectiveStep) {
      case "choice":
        return (
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground text-center">
              {t("choiceDescription")}
            </p>
            <div className="grid gap-4">
              <Button
                variant="outline"
                className="h-auto flex-col gap-3 p-6"
                onClick={() => handleChoiceSelect("form")}
              >
                <FileText className="h-8 w-8" />
                <div className="space-y-1 text-center">
                  <p className="font-semibold">{t("manualEntry")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("manualEntryDesc")}
                  </p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-3 p-6"
                onClick={() => handleChoiceSelect("qr-scanner")}
              >
                <QrCode className="h-8 w-8" />
                <div className="space-y-1 text-center">
                  <p className="font-semibold">{t("scanQR")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("scanQRDesc")}
                  </p>
                </div>
              </Button>
            </div>
          </div>
        );

      case "qr-scanner":
        return (
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToChoice}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("back")}
            </Button>
            <QRScannerStep onScanSuccess={handleQRScanSuccess} />
          </div>
        );

      case "form":
        return (
          <div className="space-y-4">
            {!isEditMode && qrData === null && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToChoice}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("back")}
              </Button>
            )}
            <TransactionForm
              onSuccess={() => handleOpenChange(false)}
              qrData={qrData}
              showInModal
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? t("editTitle") : t("title")}</DialogTitle>
          {effectiveStep === "choice" && (
            <DialogDescription>{t("choiceTitle")}</DialogDescription>
          )}
        </DialogHeader>
        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
}
