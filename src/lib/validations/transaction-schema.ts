import { z } from "zod";

export const transactionTypeEnum = z.enum(["income", "expense"]);
export const priorityEnum = z.enum([
  "very_high",
  "high",
  "medium",
  "low",
  "very_low",
]);

export const paymentTypeEnum = z.enum(["single", "installments"]);

export const transactionSchema = z.object({
  type: transactionTypeEnum,
  name: z.string().min(1, "Name is required"),
  value: z.coerce
    .number({ invalid_type_error: "Value must be a number" })
    .positive("Value must be a positive number")
    .multipleOf(0.01, "Value can have at most 2 decimal places"),
  currency: z.string().default("USD"),
  dueDate: z.date({ required_error: "Due date is required" }),
  priority: priorityEnum,
  paid: z.boolean().default(false),
});

export const installmentFormSchema = z.object({
  paymentType: paymentTypeEnum,
  type: transactionTypeEnum,
  name: z.string().min(1, "Name is required"),
  value: z.coerce
    .number({ invalid_type_error: "Value must be a number" })
    .positive("Value must be a positive number")
    .multipleOf(0.01, "Value can have at most 2 decimal places"),
  currency: z.string().default("USD"),
  startDate: z.date({ required_error: "Start date is required" }),
  priority: priorityEnum,
  installmentCount: z.coerce
    .number({ invalid_type_error: "Installment count must be a number" })
    .int("Installment count must be a whole number")
    .min(2, "Minimum 2 installments required")
    .max(60, "Maximum 60 installments allowed")
    .optional(),
});

export const installmentPlanSchema = z.object({
  name: z.string().min(1, "Name is required"),
  totalValue: z.coerce
    .number({ invalid_type_error: "Value must be a number" })
    .positive("Value must be a positive number")
    .multipleOf(0.01, "Value can have at most 2 decimal places"),
  currency: z.string().default("USD"),
  startDate: z.date({ required_error: "Start date is required" }),
  priority: priorityEnum,
  installmentCount: z.coerce
    .number({ invalid_type_error: "Installment count must be a number" })
    .int("Installment count must be a whole number")
    .min(2, "Minimum 2 installments required")
    .max(60, "Maximum 60 installments allowed"),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
export type InstallmentFormData = z.infer<typeof installmentFormSchema>;
export type InstallmentPlanData = z.infer<typeof installmentPlanSchema>;
