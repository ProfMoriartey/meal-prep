"use server";

import { db } from "~/server/db";
import { meal_plans } from "~/server/db/schema";
import { and, eq, desc, sql } from "drizzle-orm";
import { auth } from "~/server/auth";
import { ZodError } from "zod";
import { createMealPlanFormSchema } from "~/lib/zod";
import { revalidatePath } from "next/cache";

type FormState = {
  success?: string;
  error?: string;
};

// 🔧 Local date formatter (YYYY-MM-DD, no timezone shift)
const formatToLocalDateString = (date: Date) =>
  date.toLocaleDateString("en-CA", { timeZone: "UTC" }); // '2025-08-22'

/**
 * Fetches all meal plans for a user within a specified date range.
 */
export async function getMealPlans(startDate: Date, endDate: Date) {
  const session = await auth();
  if (!session?.user?.id) return [];

  const startDateString = formatToLocalDateString(startDate);
  const endDateString = formatToLocalDateString(endDate);

  console.log("🔎 Querying meal plans from:", startDateString, "to:", endDateString);

  const userMealPlans = await db.query.meal_plans.findMany({
    where: and(
      eq(meal_plans.userId, session.user.id),
      startDateString === endDateString
        ? sql`${meal_plans.plannedDate} = ${startDateString}`
        : sql`${meal_plans.plannedDate} >= ${startDateString} AND ${meal_plans.plannedDate} <= ${endDateString}`
    ),
    with: {
      meal: true,
    },
    orderBy: [desc(meal_plans.plannedDate)],
  });

  return userMealPlans;
}

/**
 * Creates a new meal plan entry for a user.
 */
export async function createMealPlan(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in to create a meal plan." };
  }

  const mealId = formData.get("mealId") as string;
  const plannedDateString = formData.get("plannedDate") as string;

  const result = createMealPlanFormSchema.safeParse({
    mealId: parseInt(mealId),
    plannedDate: plannedDateString,
  });

  if (!result.success) {
    if (result.error instanceof ZodError) {
      const errorMessages = result.error.issues.map(err => err.message).join(", ");
      return { error: `Validation failed: ${errorMessages}` };
    }
    return { error: "Validation failed." };
  }

  const { data } = result;

  try {
    const [newPlan] = await db
      .insert(meal_plans)
      .values({
        userId: session.user.id,
        mealId: data.mealId,
        plannedDate: data.plannedDate,
      })
      .returning({ id: meal_plans.id });

    if (!newPlan) {
      return { error: "Failed to create meal plan." };
    }

    revalidatePath("/plan");

    return { success: "Meal planned successfully!" };
  } catch (err) {
    console.error("❌ Database insertion failed:", err);
    return { error: "An unexpected error occurred." };
  }
}

/**
 * Deletes a meal plan entry from the database.
 */
export async function deleteMealPlan(mealPlanId: number): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in to delete a meal plan." };
  }

  const result = await db
    .delete(meal_plans)
    .where(and(eq(meal_plans.id, mealPlanId), eq(meal_plans.userId, session.user.id)))
    .returning({ id: meal_plans.id });

  if (result.length === 0) {
    return { error: "Meal plan not found or you don't have permission to delete it." };
  }

  revalidatePath("/plan");

  return { success: `Meal plan with ID ${mealPlanId} deleted.` };
}
