import {
  boolean,
  index,
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
  }),
);

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
