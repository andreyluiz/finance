import {
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const transactionTypeEnum = pgEnum("transaction_type", [
  "income",
  "expense",
]);

export const priorityEnum = pgEnum("priority", [
  "very_high",
  "high",
  "medium",
  "low",
  "very_low",
]);

export const paymentReferenceTypeEnum = pgEnum("payment_reference_type", [
  "SWISS_QR_BILL",
]);

export const installmentPlans = pgTable(
  "installment_plans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    totalValue: numeric("total_value", { precision: 19, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("USD"),
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    priority: priorityEnum("priority").notNull(),
    installmentCount: integer("installment_count").notNull(),
    paymentReference: text("payment_reference"),
    paymentReferenceType: paymentReferenceTypeEnum("payment_reference_type"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdIdx: index("installment_plans_user_id_idx").on(table.userId),
  }),
);

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    type: transactionTypeEnum("type").notNull(),
    name: text("name").notNull(),
    value: numeric("value", { precision: 19, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("USD"),
    dueDate: timestamp("due_date", { withTimezone: true }).notNull(),
    priority: priorityEnum("priority").notNull(),
    paid: boolean("paid").notNull().default(false),
    installmentPlanId: uuid("installment_plan_id").references(
      () => installmentPlans.id,
      { onDelete: "cascade" },
    ),
    installmentNumber: integer("installment_number"),
    paymentReference: text("payment_reference"),
    paymentReferenceType: paymentReferenceTypeEnum("payment_reference_type"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdIdx: index("transactions_user_id_idx").on(table.userId),
    sortIdx: index("transactions_sort_idx").on(
      table.userId,
      table.paid,
      table.priority,
      table.createdAt,
    ),
    installmentPlanIdx: index("transactions_installment_plan_idx").on(
      table.installmentPlanId,
    ),
  }),
);

export const spendingCategories = pgTable(
  "spending_categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    color: text("color").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdIdx: index("spending_categories_user_id_idx").on(table.userId),
  }),
);

export const spendingCategoryEntries = pgTable(
  "spending_category_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => spendingCategories.id, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 19, scale: 2 }).notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    categoryIdIdx: index("spending_category_entries_category_id_idx").on(
      table.categoryId,
    ),
  }),
);

export type InstallmentPlan = typeof installmentPlans.$inferSelect;
export type NewInstallmentPlan = typeof installmentPlans.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type SpendingCategory = typeof spendingCategories.$inferSelect;
export type NewSpendingCategory = typeof spendingCategories.$inferInsert;
export type SpendingCategoryEntry = typeof spendingCategoryEntries.$inferSelect;
export type NewSpendingCategoryEntry =
  typeof spendingCategoryEntries.$inferInsert;
