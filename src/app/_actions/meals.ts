"use server";

import { db } from "~/server/db";
import { meals, ingredients, meal_to_ingredients } from "~/server/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { createMealFormSchema } from "~/lib/zod";
import { auth } from "~/server/auth";
import { ZodError } from "zod";

type FormState = {
  success?: string;
  error?: string;
};

export async function createMeal(prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in to create a meal." };
  }

  const ingredientsString = formData.get("ingredients") as string;
  const mealName = formData.get("mealName") as string;

  // FIX: Explicitly type `ingredientData` to prevent 'any' assignment errors.
  let ingredientData: unknown;
  try {
    ingredientData = JSON.parse(ingredientsString);
  } catch (err: unknown) {
    console.error("JSON parsing error:", err);
    return { error: "Invalid ingredients format. Please provide a valid JSON array." };
  }

  // FIX: Type assertion to tell Zod what the data looks like.
  const result = createMealFormSchema.safeParse({
    mealName: mealName,
    ingredients: ingredientData,
  });

  if (!result.success) {
    if (result.error instanceof ZodError) {
      const errorMessages = result.error.issues.map(err => err.message).join(", ");
      console.error("Zod validation failed:", errorMessages);
      return { error: `Validation failed: ${errorMessages}` };
    }
    return { error: "Validation failed." };
  }

  const { data } = result;

  try {
    await db.transaction(async (tx) => {
      // Create the meal first
      const [newMeal] = await tx
        .insert(meals)
        .values({ name: data.mealName, userId: session.user.id })
        .returning({ id: meals.id });

      if (!newMeal) {
        throw new Error("Failed to create meal.");
      }

      // Collect all ingredient names from the form data
      const ingredientNames = data.ingredients.map(item => item.name);

      // Find existing ingredients
      const existingIngredients = await tx.query.ingredients.findMany({
        where: inArray(ingredients.name, ingredientNames),
      });

      const existingIngredientNames = new Set(existingIngredients.map(ing => ing.name));
      const newIngredientNames = ingredientNames.filter(name => !existingIngredientNames.has(name));

      // Insert new ingredients in a single batch if there are any
      if (newIngredientNames.length > 0) {
        await tx.insert(ingredients).values(newIngredientNames.map(name => ({ name })));
      }

      // Get all ingredient IDs, including newly created ones
      const allIngredients = await tx.query.ingredients.findMany({
        where: inArray(ingredients.name, ingredientNames),
      });

      const ingredientNameToIdMap = new Map(allIngredients.map(ing => [ing.name, ing.id]));

      // Insert the meal-to-ingredient relationships
      const mealToIngredientsData = data.ingredients.map(item => ({
        mealId: newMeal.id,
        ingredientId: ingredientNameToIdMap.get(item.name)!,
        quantity: item.quantity,
      }));

      await tx.insert(meal_to_ingredients).values(mealToIngredientsData);
    });

    return { success: "Meal created successfully!" };
  } catch (err) {
    console.error("Database transaction failed:", err);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

export async function deleteMeal(mealId: number): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in to delete a meal." };
  }

  const result = await db.delete(meals).where(and(eq(meals.id, mealId), eq(meals.userId, session.user.id))).returning({ id: meals.id });

  if (result.length === 0) {
    return { error: "Meal not found or you don't have permission to delete it." };
  }

  return { success: `Meal with ID ${mealId} deleted.` };
}
