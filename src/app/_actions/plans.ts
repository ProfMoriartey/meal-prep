"use server";

import { db } from "~/server/db";
import { meal_plans } from "~/server/db/schema";
import { and, eq, desc, sql } from "drizzle-orm";
import { auth } from "~/server/auth";
import { ZodError } from "zod";
import { createMealPlanFormSchema } from "~/lib/zod";
import { revalidatePath } from "next/cache";

// A consistent return type for all server actions
type FormState = {
  success?: string;
  error?: string;
};

/**
 * Fetches all meal plans for a user within a specified date range.
 * This function also fetches the full meal details for each plan.
 */
export async function getMealPlans(startDate: Date, endDate: Date) {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }
  
  // FIX: Use `sql` template literals for the `between` clause to avoid type issues.
  // This explicitly tells Drizzle to treat the values as part of the SQL query.
  const userMealPlans = await db.query.meal_plans.findMany({
    where: and(
      eq(meal_plans.userId, session.user.id),
      sql`${meal_plans.plannedDate} BETWEEN ${startDate.toISOString().split('T')[0]} AND ${endDate.toISOString().split('T')[0]}`
    ),
    // Use `with` to fetch the related `meal` data
    with: {
      meal: true,
    },
    orderBy: [desc(meal_plans.plannedDate)],
  });

  return userMealPlans;
}

/**
 * Creates a new meal plan entry for a user.
 * It validates the input data using the `createMealPlanFormSchema`.
 */
export async function createMealPlan(prevState: FormState, formData: FormData): Promise<FormState> {
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
        // FIX: Use a non-null assertion (!) because we have already checked for `session?.user?.id`
        // The type is guaranteed to be a string at this point.
        userId: session.user.id,
        mealId: data.mealId,
        plannedDate: data.plannedDate,
      })
      .returning({ id: meal_plans.id });

    if (!newPlan) {
      return { error: "Failed to create meal plan." };
    }

    revalidatePath("/plan"); // Revalidate the plan page after a successful mutation

    return { success: "Meal planned successfully!" };
  } catch (err) {
    console.error("Database insertion failed:", err);
    return { error: "An unexpected error occurred." };
  }
}

/**
 * Deletes a meal plan entry from the database.
 * It ensures the user has permission to delete the plan.
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

  revalidatePath("/plan"); // Revalidate the plan page after a successful mutation

  return { success: `Meal plan with ID ${mealPlanId} deleted.` };
}
