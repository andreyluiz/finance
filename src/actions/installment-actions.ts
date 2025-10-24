"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import type { InstallmentPlan } from "@/db/schema";
import { installmentPlans, transactions } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { calculateInstallments } from "@/lib/utils/calculate-installments";
import { installmentPlanSchema } from "@/lib/validations/transaction-schema";

interface CreateInstallmentPlanInput {
  name: string;
  totalValue: number;
  currency: string;
  startDate: Date;
  priority: "very_high" | "high" | "medium" | "low" | "very_low";
  installmentCount: number;
  type: "income" | "expense";
  paymentReference?: string | null;
  paymentReferenceType?: "SWISS_QR_BILL" | null;
}

export async function createInstallmentPlanAction(
  data: CreateInstallmentPlanInput,
): Promise<{
  success: boolean;
  error?: string;
  installmentPlan?: InstallmentPlan;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate input
    const validation = installmentPlanSchema.safeParse({
      name: data.name,
      totalValue: data.totalValue,
      currency: data.currency,
      startDate: data.startDate,
      priority: data.priority,
      installmentCount: data.installmentCount,
    });

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || "Validation error",
      };
    }

    // Calculate installment breakdown
    const installmentBreakdown = calculateInstallments({
      totalValue: data.totalValue,
      startDate: data.startDate,
      installmentCount: data.installmentCount,
    });

    // Create installment plan and all transactions in a single transaction
    const result = await db.transaction(async (tx) => {
      // Create the installment plan
      const [plan] = await tx
        .insert(installmentPlans)
        .values({
          userId: user.id,
          name: data.name,
          totalValue: data.totalValue.toString(),
          currency: data.currency,
          startDate: data.startDate,
          priority: data.priority,
          installmentCount: data.installmentCount,
          paymentReference: data.paymentReference || null,
          paymentReferenceType: data.paymentReferenceType || null,
        })
        .returning();

      if (!plan) {
        throw new Error("Failed to create installment plan");
      }

      // Create all installment transactions
      const transactionValues = installmentBreakdown.map((installment) => ({
        userId: user.id,
        type: data.type,
        name: `${data.name} (${installment.installmentNumber}/${data.installmentCount})`,
        value: installment.value.toString(),
        currency: data.currency,
        dueDate: installment.dueDate,
        priority: data.priority,
        paid: false,
        installmentPlanId: plan.id,
        installmentNumber: installment.installmentNumber,
        paymentReference: data.paymentReference || null,
        paymentReferenceType: data.paymentReferenceType || null,
      }));

      await tx.insert(transactions).values(transactionValues);

      return plan;
    });

    revalidatePath("/app/transactions");

    return { success: true, installmentPlan: result };
  } catch (error) {
    console.error("Error creating installment plan:", error);
    return {
      success: false,
      error: "Failed to create installment plan and transactions",
    };
  }
}

export async function deleteInstallmentPlanAction(
  installmentPlanId: string,
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify the installment plan belongs to the user
    const [plan] = await db
      .select()
      .from(installmentPlans)
      .where(eq(installmentPlans.id, installmentPlanId))
      .limit(1);

    if (!plan) {
      return { success: false, error: "Installment plan not found" };
    }

    if (plan.userId !== user.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Delete the installment plan (cascade will delete all related transactions)
    await db
      .delete(installmentPlans)
      .where(eq(installmentPlans.id, installmentPlanId));

    revalidatePath("/app/transactions");

    return { success: true };
  } catch (error) {
    console.error("Error deleting installment plan:", error);
    return {
      success: false,
      error: "Failed to delete installment plan",
    };
  }
}
