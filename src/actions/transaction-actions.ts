"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import type { NewTransaction, Transaction } from "@/db/schema";
import { transactions } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { sortTransactions } from "@/lib/utils/sort-transactions";
import { transactionSchema } from "@/lib/validations/transaction-schema";

export async function getTransactionsAction(): Promise<Transaction[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const userTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, user.id));

    return sortTransactions(userTransactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
}

export async function createTransactionAction(
  data: Omit<NewTransaction, "userId">,
): Promise<{ success: boolean; error?: string; transaction?: Transaction }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate input
    const validation = transactionSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message || "Validation error",
      };
    }

    const [transaction] = await db
      .insert(transactions)
      .values({
        ...data,
        userId: user.id,
      })
      .returning();

    revalidatePath("/app/transactions");

    return { success: true, transaction };
  } catch (error) {
    console.error("Error creating transaction:", error);
    return { success: false, error: "Failed to create transaction" };
  }
}

export async function updateTransactionAction(
  id: string,
  data: Partial<NewTransaction>,
): Promise<{ success: boolean; error?: string; transaction?: Transaction }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify ownership
    const [existingTransaction] = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)));

    if (!existingTransaction) {
      return { success: false, error: "Transaction not found" };
    }

    // Validate input if provided
    if (Object.keys(data).length > 0) {
      const validation = transactionSchema.partial().safeParse(data);
      if (!validation.success) {
        return {
          success: false,
          error: validation.error.errors[0]?.message || "Validation error",
        };
      }
    }

    const [transaction] = await db
      .update(transactions)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)))
      .returning();

    revalidatePath("/app/transactions");

    return { success: true, transaction };
  } catch (error) {
    console.error("Error updating transaction:", error);
    return { success: false, error: "Failed to update transaction" };
  }
}

export async function deleteTransactionAction(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify ownership
    const [existingTransaction] = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)));

    if (!existingTransaction) {
      return { success: false, error: "Transaction not found" };
    }

    await db
      .delete(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)));

    revalidatePath("/app/transactions");

    return { success: true };
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return { success: false, error: "Failed to delete transaction" };
  }
}

export async function updateTransactionPaidAction(
  id: string,
  paid: boolean,
): Promise<{ success: boolean; error?: string; transaction?: Transaction }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify ownership
    const [existingTransaction] = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)));

    if (!existingTransaction) {
      return { success: false, error: "Transaction not found" };
    }

    const [transaction] = await db
      .update(transactions)
      .set({
        paid,
        updatedAt: new Date(),
      })
      .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)))
      .returning();

    revalidatePath("/app/transactions");

    return { success: true, transaction };
  } catch (error) {
    console.error("Error updating transaction paid status:", error);
    return { success: false, error: "Failed to update transaction" };
  }
}
