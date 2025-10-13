"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  createTransactionAction,
  updateTransactionAction,
} from "@/actions/transaction-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QUERY_KEYS } from "@/lib/react-query";
import {
  type TransactionFormData,
  transactionSchema,
} from "@/lib/validations/transaction-schema";
import { useTransactionStore } from "@/stores/transaction-store";

interface TransactionFormProps {
  className?: string;
}

export function TransactionForm({ className }: TransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { editingTransaction, isEditMode, clearEditMode } =
    useTransactionStore();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      currency: "USD",
      priority: "medium",
      paid: false,
    },
  });

  const selectedType = watch("type");
  const selectedPriority = watch("priority");

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && editingTransaction) {
      // Format date to YYYY-MM-DD for input[type="date"]
      const dueDate = new Date(editingTransaction.dueDate);
      const formattedDate = dueDate.toISOString().split("T")[0];

      // Reset all fields except date
      reset({
        type: editingTransaction.type,
        name: editingTransaction.name,
        value: Number(editingTransaction.value),
        currency: editingTransaction.currency,
        dueDate: new Date(editingTransaction.dueDate),
        priority: editingTransaction.priority,
        paid: editingTransaction.paid,
      });

      // Set date field value separately as string for input[type="date"]
      setValue("dueDate", formattedDate as unknown as Date);
    }
  }, [isEditMode, editingTransaction, reset, setValue]);

  const onSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true);

    try {
      if (isEditMode && editingTransaction) {
        const result = await updateTransactionAction(
          editingTransaction.id,
          data,
        );

        if (result.success) {
          toast.success("Transaction updated successfully");
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });
          handleCancel();
        } else {
          toast.error(result.error || "Failed to update transaction");
        }
      } else {
        const result = await createTransactionAction(data);

        if (result.success) {
          toast.success("Transaction created successfully");
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });
          reset();
        } else {
          toast.error(result.error || "Failed to create transaction");
        }
      }
    } catch (_error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    clearEditMode();
    reset({
      type: "expense",
      currency: "USD",
      priority: "medium",
      paid: false,
      name: "",
      value: undefined,
      dueDate: undefined,
    });
  };

  return (
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
          {isEditMode ? "Edit Transaction" : "Add Transaction"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={selectedType}
              onValueChange={(value) =>
                setValue("type", value as "income" | "expense")
              }
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Transaction name"
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
            <Label htmlFor="value">Value</Label>
            <Input
              id="value"
              type="number"
              step="0.01"
              placeholder="0.00"
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
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              type="text"
              placeholder="USD"
              {...register("currency")}
              aria-describedby={errors.currency ? "currency-error" : undefined}
            />
            {errors.currency && (
              <p id="currency-error" className="text-sm text-destructive">
                {errors.currency.message}
              </p>
            )}
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              {...register("dueDate", {
                setValueAs: (value) => (value ? new Date(value) : undefined),
              })}
              aria-describedby={errors.dueDate ? "dueDate-error" : undefined}
            />
            {errors.dueDate && (
              <p id="dueDate-error" className="text-sm text-destructive">
                {errors.dueDate.message}
              </p>
            )}
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
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
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="very_high">Very High</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="very_low">Very Low</SelectItem>
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
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                  ? "Update"
                  : "Create"}
            </Button>
            {isEditMode && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
