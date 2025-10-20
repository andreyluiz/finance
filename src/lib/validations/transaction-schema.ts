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

// Type-safe translation function type
type TranslateFn = (key: string) => string;

// Factory function for creating transaction schema with i18n support
export const createTransactionSchema = (t: TranslateFn) =>
  z.object({
    type: transactionTypeEnum,
    name: z.string().min(1, t("nameRequired")),
    value: z.coerce
      .number({ error: t("valueRequired") })
      .positive(t("valuePositive"))
      .multipleOf(0.01, t("valueDecimals")),
    currency: z.string().default("USD"),
    dueDate: z.date({ error: t("dueDateRequired") }),
    priority: priorityEnum,
    paid: z.boolean().default(false),
  });

// Factory function for creating installment form schema with i18n support
export const createInstallmentFormSchema = (t: TranslateFn) =>
  z.object({
    paymentType: paymentTypeEnum,
    type: transactionTypeEnum,
    name: z.string().min(1, t("nameRequired")),
    value: z.coerce
      .number({ error: t("valueRequired") })
      .positive(t("valuePositive"))
      .multipleOf(0.01, t("valueDecimals")),
    currency: z.string().default("USD"),
    startDate: z.date({ error: t("startDateRequired") }),
    priority: priorityEnum,
    installmentCount: z.coerce
      .number({ error: t("installmentCountRequired") })
      .int(t("installmentCountInteger"))
      .min(2, t("installmentCountMin"))
      .max(60, t("installmentCountMax"))
      .optional(),
  });

// Factory function for creating installment plan schema with i18n support
export const createInstallmentPlanSchema = (t: TranslateFn) =>
  z.object({
    name: z.string().min(1, t("nameRequired")),
    totalValue: z.coerce
      .number({ error: t("valueRequired") })
      .positive(t("valuePositive"))
      .multipleOf(0.01, t("valueDecimals")),
    currency: z.string().default("USD"),
    startDate: z.date({ error: t("startDateRequired") }),
    priority: priorityEnum,
    installmentCount: z.coerce
      .number({ error: t("installmentCountRequired") })
      .int(t("installmentCountInteger"))
      .min(2, t("installmentCountMin"))
      .max(60, t("installmentCountMax")),
  });

// Keep the old schemas for backward compatibility (using English messages as fallback)
export const transactionSchema = createTransactionSchema((key) => key);
export const installmentFormSchema = createInstallmentFormSchema((key) => key);
export const installmentPlanSchema = createInstallmentPlanSchema((key) => key);

export type TransactionFormData = z.infer<typeof transactionSchema>;
export type InstallmentFormData = z.infer<typeof installmentFormSchema>;
export type InstallmentPlanData = z.infer<typeof installmentPlanSchema>;
