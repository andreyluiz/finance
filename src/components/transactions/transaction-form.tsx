"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createInstallmentPlanAction } from "@/actions/installment-actions";
import {
  createTransactionAction,
  updateTransactionAction,
} from "@/actions/transaction-actions";
import { InstallmentPreviewModal } from "@/components/transactions/installment-preview-modal";
import { QRScannerModal } from "@/components/transactions/qr-scanner-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { QUERY_KEYS } from "@/lib/react-query";
import {
  calculateInstallments,
  type InstallmentBreakdown,
} from "@/lib/utils/calculate-installments";
import {
  createInstallmentFormSchema,
  type InstallmentFormData,
} from "@/lib/validations/transaction-schema";
import { useTransactionStore } from "@/stores/transaction-store";

interface TransactionFormProps {
  onSuccess?: () => void;
  qrData?: {
    name: string;
    value: number;
    currency: string;
    dueDate: Date | null;
    paymentReference: string;
    paymentReferenceType: string;
  } | null;
  showInModal?: boolean;
}

export function TransactionForm({
  onSuccess,
  qrData,
  showInModal = false,
}: TransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [installmentBreakdown, setInstallmentBreakdown] = useState<
    InstallmentBreakdown[]
  >([]);
  const [pendingInstallmentData, setPendingInstallmentData] =
    useState<InstallmentFormData | null>(null);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);

  const { editingTransaction, isEditMode, clearEditMode } =
    useTransactionStore();
  const queryClient = useQueryClient();

  const t = useTranslations("transactions.form");
  const tSuccess = useTranslations("transactions.success");
  const tErrors = useTranslations("transactions.errors");
  const tPriority = useTranslations("transactions.priority");
  const tStatus = useTranslations("transactions.status");
  const tValidation = useTranslations("validation");

  // Calculate last day of current month for default date
  const getLastDayOfMonth = () => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return lastDay.toISOString().split("T")[0];
  };

  // Get cached currency from localStorage
  const getCachedCurrency = () => {
    if (typeof window === "undefined") return "USD";
    return localStorage.getItem("lastUsedCurrency") || "USD";
  };

  const form = useForm<InstallmentFormData>({
    resolver: zodResolver(
      createInstallmentFormSchema(tValidation),
    ) as Resolver<InstallmentFormData>,
    defaultValues: {
      paymentType: "single",
      type: "expense",
      name: "",
      currency: getCachedCurrency(),
      priority: "medium",
      startDate: new Date(getLastDayOfMonth()),
      value: undefined,
      installmentCount: undefined,
      installmentValue: undefined,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = form;

  const selectedPaymentType = watch("paymentType");
  const selectedType = watch("type");
  const selectedPriority = watch("priority");
  const selectedCurrency = watch("currency");
  const totalValue = watch("value");
  const installmentCount = watch("installmentCount");
  const installmentValue = watch("installmentValue");

  // Handle QR data from parent component
  useEffect(() => {
    if (qrData) {
      setValue("name", qrData.name);
      setValue("value", qrData.value);
      setValue("currency", qrData.currency);
      if (qrData.dueDate) {
        setValue("startDate", qrData.dueDate);
      }
      setPaymentReference(qrData.paymentReference);
    }
  }, [qrData, setValue]);

  // Cache currency to localStorage when it changes
  useEffect(() => {
    if (selectedCurrency && !isEditMode) {
      localStorage.setItem("lastUsedCurrency", selectedCurrency);
    }
  }, [selectedCurrency, isEditMode]);

  // Track which field was last modified to prevent infinite loops
  const lastModifiedField = useRef<"total" | "installment" | null>(null);
  const isCalculating = useRef(false);

  // Bidirectional calculation for installments
  useEffect(() => {
    // Skip if we're already calculating or if not in installments mode
    if (
      isCalculating.current ||
      selectedPaymentType !== "installments" ||
      !installmentCount ||
      installmentCount < 2
    ) {
      return;
    }

    // Calculate installment value from total value
    if (lastModifiedField.current === "total" && totalValue) {
      isCalculating.current = true;
      const calculated = totalValue / installmentCount;
      const rounded = Math.round(calculated * 100) / 100;
      setValue("installmentValue", rounded, { shouldValidate: false });
      lastModifiedField.current = null;
      isCalculating.current = false;
    }
    // Calculate total value from installment value
    else if (lastModifiedField.current === "installment" && installmentValue) {
      isCalculating.current = true;
      const calculated = installmentValue * installmentCount;
      const rounded = Math.round(calculated * 100) / 100;
      setValue("value", rounded, { shouldValidate: false });
      lastModifiedField.current = null;
      isCalculating.current = false;
    }
  }, [
    totalValue,
    installmentValue,
    installmentCount,
    selectedPaymentType,
    setValue,
  ]);

  // Populate form when editing (single transactions only)
  useEffect(() => {
    if (isEditMode && editingTransaction) {
      console.log("=== POPULATE FORM FOR EDIT ===");
      console.log("Transaction priority:", editingTransaction.priority);

      // Format date to YYYY-MM-DD for input[type="date"]
      const dueDate = new Date(editingTransaction.dueDate);
      const formattedDate = dueDate.toISOString().split("T")[0];

      // Set each field individually to ensure they all update
      setValue("paymentType", "single");
      setValue("type", editingTransaction.type);
      setValue("name", editingTransaction.name);
      setValue("value", Number(editingTransaction.value));
      setValue("currency", editingTransaction.currency);
      setValue("startDate", formattedDate as unknown as Date);
      setValue("priority", editingTransaction.priority);

      console.log("Priority set to:", editingTransaction.priority);

      // Verify it worked
      setTimeout(() => {
        const currentPriority = form.getValues("priority");
        console.log("Priority after setValue:", currentPriority);
      }, 100);

      // Load payment reference if it exists
      setPaymentReference(editingTransaction.paymentReference || null);
    }
  }, [isEditMode, editingTransaction, setValue, form]);

  const onSubmit = async (data: InstallmentFormData) => {
    // Edit mode - update single transaction
    if (isEditMode && editingTransaction) {
      setIsSubmitting(true);

      try {
        if (!data.value) {
          toast.error(tErrors("createFailed"));
          setIsSubmitting(false);
          return;
        }

        const result = await updateTransactionAction(editingTransaction.id, {
          type: data.type,
          name: data.name,
          value: data.value.toString(),
          currency: data.currency,
          dueDate: data.startDate,
          priority: data.priority,
          paid: editingTransaction.paid,
          paymentReference: paymentReference || null,
          paymentReferenceType: paymentReference ? "SWISS_QR_BILL" : null,
        });

        if (result.success) {
          toast.success(tSuccess("updated"));
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });
          handleCancel();
          onSuccess?.();
        } else {
          toast.error(result.error || tErrors("updateFailed"));
        }
      } catch (_error) {
        toast.error(tErrors("unexpected"));
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Create mode - single payment
    if (data.paymentType === "single") {
      setIsSubmitting(true);

      try {
        if (!data.value) {
          toast.error(tErrors("createFailed"));
          setIsSubmitting(false);
          return;
        }

        const result = await createTransactionAction({
          type: data.type,
          name: data.name,
          value: data.value.toString(),
          currency: data.currency,
          dueDate: data.startDate,
          priority: data.priority,
          paid: false,
          paymentReference: paymentReference || null,
          paymentReferenceType: paymentReference ? "SWISS_QR_BILL" : null,
        });

        if (result.success) {
          toast.success(tSuccess("created"));
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });
          if (showInModal) {
            onSuccess?.();
          } else {
            reset({
              paymentType: "single",
              type: "expense",
              currency: getCachedCurrency(),
              priority: "medium",
              name: "",
              value: undefined,
              startDate: getLastDayOfMonth() as unknown as Date,
            });
          }
        } else {
          toast.error(result.error || tErrors("createFailed"));
        }
      } catch (_error) {
        toast.error(tErrors("unexpected"));
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Create mode - installments payment
    if (data.paymentType === "installments") {
      // Validate installment count is provided
      if (!data.installmentCount || data.installmentCount < 2) {
        toast.error(tErrors("invalidInstallments"));
        return;
      }

      // Validate value is provided
      if (!data.value) {
        toast.error(tErrors("createFailed"));
        return;
      }

      // Calculate installment breakdown
      const breakdown = calculateInstallments({
        totalValue: data.value,
        startDate: data.startDate,
        installmentCount: data.installmentCount,
      });

      // Store data and show preview modal
      setPendingInstallmentData(data);
      setInstallmentBreakdown(breakdown);
      setShowPreviewModal(true);
    }
  };

  const handleConfirmInstallments = async () => {
    if (!pendingInstallmentData || !pendingInstallmentData.value) return;

    setIsSubmitting(true);

    try {
      const result = await createInstallmentPlanAction({
        name: pendingInstallmentData.name,
        totalValue: pendingInstallmentData.value,
        currency: pendingInstallmentData.currency,
        startDate: pendingInstallmentData.startDate,
        priority: pendingInstallmentData.priority,
        installmentCount: pendingInstallmentData.installmentCount || 2,
        type: pendingInstallmentData.type,
        paymentReference: paymentReference || null,
        paymentReferenceType: paymentReference ? "SWISS_QR_BILL" : null,
      });

      if (result.success) {
        toast.success(
          tSuccess("installmentPlanCreated", {
            count: pendingInstallmentData.installmentCount as number,
          }),
        );
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });

        setShowPreviewModal(false);
        setPendingInstallmentData(null);
        setInstallmentBreakdown([]);

        if (showInModal) {
          onSuccess?.();
        } else {
          reset({
            paymentType: "single",
            type: "expense",
            currency: getCachedCurrency(),
            priority: "medium",
            name: "",
            value: undefined,
            startDate: getLastDayOfMonth() as unknown as Date,
          });
        }
      } else {
        toast.error(result.error || tErrors("installmentPlanFailed"));
      }
    } catch (_error) {
      toast.error(tErrors("unexpected"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    clearEditMode();
    setPaymentReference(null);
    reset({
      paymentType: "single",
      type: "expense",
      currency: getCachedCurrency(),
      priority: "medium",
      name: "",
      value: undefined,
      startDate: getLastDayOfMonth() as unknown as Date,
    });
  };

  const handleQRScanSuccess = (data: {
    name: string;
    value: number;
    currency: string;
    dueDate: Date | null;
    paymentReference: string;
    paymentReferenceType: string;
  }) => {
    // Update form fields
    setValue("name", data.name);
    setValue("value", data.value);
    setValue("currency", data.currency);
    if (data.dueDate) {
      const formattedDate = new Date(data.dueDate).toISOString().split("T")[0];
      setValue("startDate", formattedDate as unknown as Date);
    }
    setPaymentReference(data.paymentReference);
    toast.success(t("qrCodeScanned"));
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* QR Code Management Section - Show in edit mode */}
        {isEditMode && (
          <div className="space-y-2">
            {paymentReference ? (
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-lg bg-muted p-3 text-center text-xs text-muted-foreground">
                  {t("qrCodeScanned")}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQRScanner(true)}
                >
                  {t("changeReference")}
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowQRScanner(true)}
                className="w-full"
              >
                {t("iHaveQRCode")}
              </Button>
            )}
          </div>
        )}

        {/* Show QR reference status in create mode if QR was scanned */}
        {!isEditMode && paymentReference && (
          <div className="rounded-lg bg-muted p-3 text-center text-xs text-muted-foreground">
            {t("qrCodeScanned")}
          </div>
        )}

        {/* Payment Type - only in create mode */}
        {!isEditMode && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">{t("paymentType")}</Label>
            <RadioGroup
              value={selectedPaymentType}
              onValueChange={(value) =>
                setValue("paymentType", value as "single" | "installments")
              }
              className="grid grid-cols-2 gap-3"
            >
              <Label
                htmlFor="single"
                className={`flex items-center justify-center gap-2 rounded-lg border-2 p-3 cursor-pointer transition-all ${
                  selectedPaymentType === "single"
                    ? "border-primary bg-primary/5 font-medium"
                    : "border-muted hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                <RadioGroupItem
                  value="single"
                  id="single"
                  className="sr-only"
                />
                <span>{t("singlePayment")}</span>
              </Label>
              <Label
                htmlFor="installments"
                className={`flex items-center justify-center gap-2 rounded-lg border-2 p-3 cursor-pointer transition-all ${
                  selectedPaymentType === "installments"
                    ? "border-primary bg-primary/5 font-medium"
                    : "border-muted hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                <RadioGroupItem
                  value="installments"
                  id="installments"
                  className="sr-only"
                />
                <span>{t("monthlyInstallments")}</span>
              </Label>
            </RadioGroup>
          </div>
        )}

        {!isEditMode && <Separator className="my-6" />}

        {/* Type and Priority - Side by Side */}
        <div className="grid grid-cols-2 gap-4">
          {/* Type */}
          <div className="space-y-3">
            <Label htmlFor="type">{t("type")}</Label>
            <Select
              value={selectedType}
              onValueChange={(value) =>
                setValue("type", value as "income" | "expense")
              }
            >
              <SelectTrigger id="type">
                <SelectValue placeholder={t("typePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">{tStatus("income")}</SelectItem>
                <SelectItem value="expense">{tStatus("expense")}</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          {/* Priority */}
          <div className="space-y-3">
            <Label htmlFor="priority">{t("priority")}</Label>
            <Select
              value={selectedPriority}
              onValueChange={(value) =>
                setValue(
                  "priority",
                  value as "very_high" | "high" | "medium" | "low" | "very_low",
                )
              }
            >
              <SelectTrigger id="priority">
                <SelectValue placeholder={t("priorityPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="very_high">
                  {tPriority("very_high")}
                </SelectItem>
                <SelectItem value="high">{tPriority("high")}</SelectItem>
                <SelectItem value="medium">{tPriority("medium")}</SelectItem>
                <SelectItem value="low">{tPriority("low")}</SelectItem>
                <SelectItem value="very_low">
                  {tPriority("very_low")}
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.priority && (
              <p className="text-sm text-destructive">
                {errors.priority.message}
              </p>
            )}
          </div>
        </div>

        {/* Name */}
        <div className="space-y-3">
          <Label htmlFor="name">{t("name")}</Label>
          <Input
            id="name"
            type="text"
            placeholder={t("namePlaceholder")}
            {...register("name")}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {errors.name && (
            <p id="name-error" className="text-sm text-destructive">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Value */}
        <div className="space-y-3">
          <Label htmlFor="value">
            {selectedPaymentType === "installments"
              ? t("totalValue")
              : t("value")}
          </Label>
          <Input
            id="value"
            type="number"
            step="0.01"
            placeholder={t("valuePlaceholder")}
            {...register("value", {
              onChange: () => {
                if (selectedPaymentType === "installments") {
                  lastModifiedField.current = "total";
                }
              },
            })}
            aria-describedby={errors.value ? "value-error" : undefined}
          />
          {errors.value && (
            <p id="value-error" className="text-sm text-destructive">
              {errors.value.message}
            </p>
          )}
        </div>

        {/* Currency */}
        <div className="space-y-3">
          <Label htmlFor="currency">{t("currency")}</Label>
          <Input
            id="currency"
            type="text"
            placeholder={t("currencyPlaceholder")}
            {...register("currency")}
            aria-describedby={errors.currency ? "currency-error" : undefined}
          />
          {errors.currency && (
            <p id="currency-error" className="text-sm text-destructive">
              {errors.currency.message}
            </p>
          )}
        </div>

        {/* Start/Due Date */}
        <div className="space-y-3">
          <Label htmlFor="startDate">
            {selectedPaymentType === "installments"
              ? t("startDate")
              : t("dueDate")}
          </Label>
          <Input
            id="startDate"
            type="date"
            {...register("startDate", {
              setValueAs: (value) => (value ? new Date(value) : undefined),
            })}
            aria-describedby={errors.startDate ? "startDate-error" : undefined}
          />
          {errors.startDate && (
            <p id="startDate-error" className="text-sm text-destructive">
              {errors.startDate.message}
            </p>
          )}
        </div>

        {/* Installment Count - only for installments payment type */}
        {!isEditMode && selectedPaymentType === "installments" && (
          <div className="space-y-3">
            <Label htmlFor="installmentCount">
              {t("numberOfInstallments")}
            </Label>
            <Input
              id="installmentCount"
              type="number"
              min="2"
              max="60"
              placeholder={t("numberOfInstallmentsPlaceholder")}
              {...register("installmentCount")}
              aria-describedby={
                errors.installmentCount ? "installmentCount-error" : undefined
              }
            />
            {errors.installmentCount && (
              <p
                id="installmentCount-error"
                className="text-sm text-destructive"
              >
                {errors.installmentCount.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {t("numberOfInstallmentsHelp")}
            </p>
          </div>
        )}

        {/* Installment Value - only for installments payment type */}
        {!isEditMode && selectedPaymentType === "installments" && (
          <div className="space-y-3">
            <Label htmlFor="installmentValue">{t("installmentValue")}</Label>
            <Input
              id="installmentValue"
              type="number"
              step="0.01"
              placeholder={t("installmentValuePlaceholder")}
              {...register("installmentValue", {
                onChange: () => {
                  lastModifiedField.current = "installment";
                },
              })}
              aria-describedby={
                errors.installmentValue ? "installmentValue-error" : undefined
              }
            />
            {errors.installmentValue && (
              <p
                id="installmentValue-error"
                className="text-sm text-destructive"
              >
                {errors.installmentValue.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {t("installmentValueHelp")}
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2">
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting
              ? isEditMode
                ? t("updating")
                : t("creating")
              : isEditMode
                ? t("update")
                : selectedPaymentType === "installments"
                  ? t("previewInstallments")
                  : t("create")}
          </Button>
          {(isEditMode || showInModal) && (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              {t("cancel")}
            </Button>
          )}
        </div>
      </form>

      {/* Installment Preview Modal */}
      {pendingInstallmentData?.value && (
        <InstallmentPreviewModal
          open={showPreviewModal}
          onOpenChange={setShowPreviewModal}
          onConfirm={handleConfirmInstallments}
          isSubmitting={isSubmitting}
          installmentData={{
            name: pendingInstallmentData.name,
            totalValue: pendingInstallmentData.value,
            currency: pendingInstallmentData.currency,
            installmentCount: pendingInstallmentData.installmentCount || 2,
          }}
          installments={installmentBreakdown}
        />
      )}

      {/* QR Scanner Modal */}
      <QRScannerModal
        open={showQRScanner}
        onOpenChange={setShowQRScanner}
        onScanSuccess={handleQRScanSuccess}
      />
    </>
  );
}
