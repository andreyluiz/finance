/**
 * Seed script to create test transactions for performance testing
 * Run with: npx tsx src/scripts/seed-transactions.ts
 */

import { config } from "dotenv";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { transactions } from "@/db/schema";

config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL!);
const db = drizzle(sql);

const priorities = ["very_high", "high", "medium", "low", "very_low"] as const;
const types = ["income", "expense"] as const;
const currencies = ["USD", "EUR", "GBP", "JPY"];

const transactionNames = [
  "Rent",
  "Groceries",
  "Utilities",
  "Internet",
  "Phone Bill",
  "Insurance",
  "Gas",
  "Dining Out",
  "Entertainment",
  "Gym Membership",
  "Netflix",
  "Spotify",
  "Coffee",
  "Books",
  "Clothing",
  "Healthcare",
  "Transportation",
  "Travel",
  "Gifts",
  "Charity",
  "Salary",
  "Freelance Work",
  "Investment Returns",
  "Bonus",
  "Side Project",
];

function getRandomElement<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)] as T;
}

function getRandomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

function getRandomValue(): string {
  // Random value between 10 and 5000
  const value = (Math.random() * 4990 + 10).toFixed(2);
  return value;
}

async function seedTransactions(userId: string, count: number) {
  console.log(`Seeding ${count} transactions for user ${userId}...`);

  const now = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const transactionsToInsert = [];

  for (let i = 0; i < count; i++) {
    const createdAt = getRandomDate(threeMonthsAgo, now);
    const dueDate = getRandomDate(
      now,
      new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
    ); // Next 90 days

    transactionsToInsert.push({
      userId,
      type: getRandomElement(types),
      name: getRandomElement(transactionNames),
      value: getRandomValue(),
      currency: getRandomElement(currencies),
      dueDate,
      priority: getRandomElement(priorities),
      paid: Math.random() > 0.5, // 50% chance of being paid
      createdAt,
      updatedAt: createdAt,
    });

    // Insert in batches of 100
    if (transactionsToInsert.length === 100 || i === count - 1) {
      await db.insert(transactions).values(transactionsToInsert);
      console.log(`Inserted ${i + 1}/${count} transactions...`);
      transactionsToInsert.length = 0;
    }
  }

  console.log(`✓ Successfully seeded ${count} transactions!`);
}

async function main() {
  const userId = process.env.TEST_USER || "test-user-id";
  const count = Number.parseInt(process.argv[2] || "100", 10);

  if (Number.isNaN(count) || count < 1) {
    console.error(
      "Invalid count. Usage: npx tsx src/scripts/seed-transactions.ts [count]",
    );
    process.exit(1);
  }

  try {
    await seedTransactions(userId, count);
  } catch (error) {
    console.error("Error seeding transactions:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
