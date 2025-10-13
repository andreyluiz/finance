import { z } from "zod";

export const transactionTypeEnum = z.enum(["income", "expense"]);
export const priorityEnum = z.enum([
  "very_high",
  "high",
  "medium",
  "low",
  "very_low",
]);

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

export type TransactionFormData = z.infer<typeof transactionSchema>;
