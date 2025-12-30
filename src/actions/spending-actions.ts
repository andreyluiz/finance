"use server";

import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  type NewSpendingCategory,
  type NewSpendingCategoryEntry,
  spendingCategories,
  spendingCategoryEntries,
} from "@/db/schema";
import { createClient } from "@/lib/supabase/server";

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getSpendingCategoriesAction() {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("Unauthorized");

  return await db
    .select()
    .from(spendingCategories)
    .where(eq(spendingCategories.userId, user.id))
    .orderBy(desc(spendingCategories.createdAt));
}

export async function createSpendingCategoryAction(
  data: Pick<NewSpendingCategory, "name" | "color">,
) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("Unauthorized");

  const [category] = await db
    .insert(spendingCategories)
    .values({
      ...data,
      userId: user.id,
    })
    .returning();

  revalidatePath("/app/transactions");
  revalidatePath("/app");
  return category;
}

export async function deleteSpendingCategoryAction(id: string) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("Unauthorized");

  const [deleted] = await db
    .delete(spendingCategories)
    .where(
      and(
        eq(spendingCategories.id, id),
        eq(spendingCategories.userId, user.id),
      ),
    )
    .returning();

  revalidatePath("/app/transactions");
  return deleted;
}

export async function addSpendingEntryAction(
  data: Pick<
    NewSpendingCategoryEntry,
    "categoryId" | "amount" | "note" | "createdAt"
  >,
) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("Unauthorized");

  const [category] = await db
    .select()
    .from(spendingCategories)
    .where(
      and(
        eq(spendingCategories.id, data.categoryId),
        eq(spendingCategories.userId, user.id),
      ),
    );

  if (!category) throw new Error("Category not found or unauthorized");

  const [entry] = await db
    .insert(spendingCategoryEntries)
    .values(data)
    .returning();

  revalidatePath("/app/transactions");
  return entry;
}

export async function bulkAddSpendingEntriesAction(
  entries: Pick<
    NewSpendingCategoryEntry,
    "categoryId" | "amount" | "note" | "createdAt"
  >[],
) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("Unauthorized");

  if (entries.length === 0) return [];

  const categoryId = entries[0].categoryId;
  const [category] = await db
    .select()
    .from(spendingCategories)
    .where(
      and(
        eq(spendingCategories.id, categoryId),
        eq(spendingCategories.userId, user.id),
      ),
    );
  if (!category) throw new Error("Category not found or unauthorized");

  const formattedEntries = entries.map((e) => {
    if (e.categoryId !== categoryId)
      throw new Error("Bulk add restricted to single category");
    return e;
  });

  const inserted = await db
    .insert(spendingCategoryEntries)
    .values(formattedEntries)
    .returning();

  revalidatePath("/app/transactions");
  return inserted;
}

export async function getSpendingEntriesAction(
  categoryId: string,
  startDate?: Date,
  endDate?: Date,
) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("Unauthorized");

  const [category] = await db
    .select()
    .from(spendingCategories)
    .where(
      and(
        eq(spendingCategories.id, categoryId),
        eq(spendingCategories.userId, user.id),
      ),
    );
  if (!category) throw new Error("Category not found or unauthorized");

  let query = db
    .select()
    .from(spendingCategoryEntries)
    .where(eq(spendingCategoryEntries.categoryId, categoryId))
    .orderBy(desc(spendingCategoryEntries.createdAt));

  if (startDate && endDate) {
    // @ts-expect-error
    query = query.where(
      and(
        eq(spendingCategoryEntries.categoryId, categoryId),
        gte(spendingCategoryEntries.createdAt, startDate),
        lte(spendingCategoryEntries.createdAt, endDate),
      ),
    );
  }

  return await query;
}

export async function getSpendingCategoryTotalsAction(
  startDate: Date,
  endDate: Date,
) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("Unauthorized");

  // Using Drizzle Query Builder with aggregation
  const results = await db
    .select({
      id: spendingCategories.id,
      name: spendingCategories.name,
      color: spendingCategories.color,
      totalAmount:
        sql<number>`COALESCE(SUM(${spendingCategoryEntries.amount}), 0)`.mapWith(
          Number,
        ),
    })
    .from(spendingCategories)
    .leftJoin(
      spendingCategoryEntries,
      and(
        eq(spendingCategories.id, spendingCategoryEntries.categoryId),
        gte(spendingCategoryEntries.createdAt, startDate),
        lte(spendingCategoryEntries.createdAt, endDate),
      ),
    )
    .where(eq(spendingCategories.userId, user.id))
    .groupBy(
      spendingCategories.id,
      spendingCategories.name,
      spendingCategories.color,
    )
    .orderBy(desc(spendingCategories.createdAt));

  return results;
}

export async function deleteSpendingEntryAction(id: string) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("Unauthorized");

  const [entry] = await db
    .select({
      id: spendingCategoryEntries.id,
      userId: spendingCategories.userId,
    })
    .from(spendingCategoryEntries)
    .innerJoin(
      spendingCategories,
      eq(spendingCategoryEntries.categoryId, spendingCategories.id),
    )
    .where(eq(spendingCategoryEntries.id, id));

  if (!entry || entry.userId !== user.id) throw new Error("Unauthorized");

  const [deleted] = await db
    .delete(spendingCategoryEntries)
    .where(eq(spendingCategoryEntries.id, id))
    .returning();

  revalidatePath("/app/transactions");
  return deleted;
}
