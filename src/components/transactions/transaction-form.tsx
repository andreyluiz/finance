"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { createInstallmentPlanAction } from "@/actions/installment-actions";
import {
  createTransactionAction,
  updateTransactionAction,
} from "@/actions/transaction-actions";
import { InstallmentPreviewModal } from "@/components/transactions/installment-preview-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { QUERY_KEYS } from "@/lib/react-query";
import {
  calculateInstallments,
  type InstallmentBreakdown,
} from "@/lib/utils/calculate-installments";
import {
  type InstallmentFormData,
  type TransactionFormData,
  installmentFormSchema,
} from "@/lib/validations/transaction-schema";
import { useTransactionStore } from "@/stores/transaction-store";

interface TransactionFormProps {
  className?: string;
}

export function TransactionForm({ className }: TransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [installmentBreakdown, setInstallmentBreakdown] = useState<
    InstallmentBreakdown[]
  >([]);
  const [pendingInstallmentData, setPendingInstallmentData] =
    useState<InstallmentFormData | null>(null);

  const { editingTransaction, isEditMode, clearEditMode } =
    useTransactionStore();
  const queryClient = useQueryClient();

  const t = useTranslations("transactions.form");
  const tSuccess = useTranslations("transactions.success");
  const tErrors = useTranslations("transactions.errors");
  const tPriority = useTranslations("transactions.priority");
  const tStatus = useTranslations("transactions.status");

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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<InstallmentFormData>({
    resolver: zodResolver(installmentFormSchema),
    defaultValues: {
      paymentType: "single",
      type: "expense",
      currency: getCachedCurrency(),
      priority: "medium",
      startDate: getLastDayOfMonth() as unknown as Date,
    },
  });

  const selectedPaymentType = watch("paymentType");
  const selectedType = watch("type");
  const selectedPriority = watch("priority");
  const selectedCurrency = watch("currency");

  // Cache currency to localStorage when it changes
  useEffect(() => {
    if (selectedCurrency && !isEditMode) {
      localStorage.setItem("lastUsedCurrency", selectedCurrency);
    }
  }, [selectedCurrency, isEditMode]);

  // Populate form when editing (single transactions only)
  useEffect(() => {
    if (isEditMode && editingTransaction) {
      // Format date to YYYY-MM-DD for input[type="date"]
      const dueDate = new Date(editingTransaction.dueDate);
      const formattedDate = dueDate.toISOString().split("T")[0];

      // Reset all fields - edit mode is always for single transactions
      reset({
        paymentType: "single",
        type: editingTransaction.type,
        name: editingTransaction.name,
        value: Number(editingTransaction.value),
        currency: editingTransaction.currency,
        startDate: formattedDate as unknown as Date,
        priority: editingTransaction.priority,
      });
    }
  }, [isEditMode, editingTransaction, reset]);

  const onSubmit = async (data: InstallmentFormData) => {
    // Edit mode - update single transaction
    if (isEditMode && editingTransaction) {
      setIsSubmitting(true);

      try {
        const result = await updateTransactionAction(editingTransaction.id, {
          type: data.type,
          name: data.name,
          value: data.value.toString(),
          currency: data.currency,
          dueDate: data.startDate,
          priority: data.priority,
          paid: editingTransaction.paid,
        });

        if (result.success) {
          toast.success(tSuccess("updated"));
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });
          handleCancel();
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
        const result = await createTransactionAction({
          type: data.type,
          name: data.name,
          value: data.value.toString(),
          currency: data.currency,
          dueDate: data.startDate,
          priority: data.priority,
          paid: false,
        });

        if (result.success) {
          toast.success(tSuccess("created"));
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });
          reset({
            paymentType: "single",
            type: "expense",
            currency: getCachedCurrency(),
            priority: "medium",
            name: "",
            value: undefined,
            startDate: getLastDayOfMonth() as unknown as Date,
          });
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
    if (!pendingInstallmentData) return;

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
      });

      if (result.success) {
        toast.success(
          tSuccess("installmentPlanCreated", { count: pendingInstallmentData.installmentCount }),
        );
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });

        // Close modal and reset form
        setShowPreviewModal(false);
        setPendingInstallmentData(null);
        setInstallmentBreakdown([]);
        reset({
          paymentType: "single",
          type: "expense",
          currency: getCachedCurrency(),
          priority: "medium",
          name: "",
          value: undefined,
          startDate: getLastDayOfMonth() as unknown as Date,
        });
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

  return (
    <>
      <Card
        className={className}
        data-edit-mode={isEditMode}
        style={
          isEditMode
            ? {
                borderColor: "hsl(var(--primary))",
                borderWidth: "2px",
              }
            : undefined
        }
      >
        <CardHeader>
          <CardTitle>
            {isEditMode ? t("editTitle") : t("title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Payment Type - only in create mode */}
            {!isEditMode && (
              <div className="space-y-2">
                <Label>{t("paymentType")}</Label>
                <RadioGroup
                  value={selectedPaymentType}
                  onValueChange={(value) =>
                    setValue("paymentType", value as "single" | "installments")
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="single" id="single" />
                    <Label
                      htmlFor="single"
                      className="font-normal cursor-pointer"
                    >
                      {t("singlePayment")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="installments" id="installments" />
                    <Label
                      htmlFor="installments"
                      className="font-normal cursor-pointer"
                    >
                      {t("monthlyInstallments")}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Type */}
            <div className="space-y-2">
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
                <p className="text-sm text-destructive">
                  {errors.type.message}
                </p>
              )}
            </div>

            {/* Name */}
            <div className="space-y-2">
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
            <div className="space-y-2">
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
                {...register("value")}
                aria-describedby={errors.value ? "value-error" : undefined}
              />
              {errors.value && (
                <p id="value-error" className="text-sm text-destructive">
                  {errors.value.message}
                </p>
              )}
            </div>

            {/* Currency */}
            <div className="space-y-2">
              <Label htmlFor="currency">{t("currency")}</Label>
              <Input
                id="currency"
                type="text"
                placeholder={t("currencyPlaceholder")}
                {...register("currency")}
                aria-describedby={
                  errors.currency ? "currency-error" : undefined
                }
              />
              {errors.currency && (
                <p id="currency-error" className="text-sm text-destructive">
                  {errors.currency.message}
                </p>
              )}
            </div>

            {/* Start/Due Date */}
            <div className="space-y-2">
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
                aria-describedby={
                  errors.startDate ? "startDate-error" : undefined
                }
              />
              {errors.startDate && (
                <p id="startDate-error" className="text-sm text-destructive">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            {/* Installment Count - only for installments payment type */}
            {!isEditMode && selectedPaymentType === "installments" && (
              <div className="space-y-2">
                <Label htmlFor="installmentCount">{t("numberOfInstallments")}</Label>
                <Input
                  id="installmentCount"
                  type="number"
                  min="2"
                  max="60"
                  placeholder={t("numberOfInstallmentsPlaceholder")}
                  {...register("installmentCount")}
                  aria-describedby={
                    errors.installmentCount
                      ? "installmentCount-error"
                      : undefined
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

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">{t("priority")}</Label>
              <Select
                value={selectedPriority}
                onValueChange={(value) =>
                  setValue(
                    "priority",
                    value as
                      | "very_high"
                      | "high"
                      | "medium"
                      | "low"
                      | "very_low",
                  )
                }
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder={t("priorityPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="very_high">{tPriority("very_high")}</SelectItem>
                  <SelectItem value="high">{tPriority("high")}</SelectItem>
                  <SelectItem value="medium">{tPriority("medium")}</SelectItem>
                  <SelectItem value="low">{tPriority("low")}</SelectItem>
                  <SelectItem value="very_low">{tPriority("very_low")}</SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-sm text-destructive">
                  {errors.priority.message}
                </p>
              )}
            </div>

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
              {isEditMode && (
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
        </CardContent>
      </Card>

      {/* Installment Preview Modal */}
      {pendingInstallmentData && (
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
    </>
  );
}
