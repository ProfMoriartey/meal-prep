"use server";

import { db } from "~/server/db";
import { meals, ingredients, meal_to_ingredients } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import { createMealFormSchema } from "~/lib/zod";
import { auth } from "~/server/auth";

export async function createMeal(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in to create a meal." };
  }

  const ingredientsString = formData.get("ingredients") as string;
  const mealName = formData.get("mealName") as string;

  let ingredientData;
  try {
    ingredientData = JSON.parse(ingredientsString);
  } catch (e) {
    return { error: "Invalid ingredients format." };
  }

  const result = createMealFormSchema.safeParse({
    mealName: mealName,
    ingredients: ingredientData,
  });

  if (!result.success) {
    console.log(result.error);
    return { error: "Validation failed." };
  }

  const { data } = result;

  const [newMeal] = await db
    .insert(meals)
    .values({ name: data.mealName, userId: session.user.id })
    .returning({ id: meals.id });

  if (!newMeal) {
    return { error: "Failed to create meal." };
  }

  for (const item of data.ingredients) {
    const existingIngredient = await db.query.ingredients.findFirst({
      where: eq(ingredients.name, item.name),
    });

    let ingredientId;

    if (existingIngredient) {
      ingredientId = existingIngredient.id;
    } else {
      const [newIngredient] = await db
        .insert(ingredients)
        .values({ name: item.name })
        .returning({ id: ingredients.id });

      if (!newIngredient) {
        return { error: `Failed to create ingredient: ${item.name}` };
      }
      ingredientId = newIngredient.id;
    }

    await db.insert(meal_to_ingredients).values({
      mealId: newMeal.id,
      ingredientId: ingredientId,
      quantity: item.quantity,
    });
  }

  return { success: "Meal created successfully!" };
}

export async function deleteMeal(mealId: number) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in to delete a meal." };
  }

  await db.delete(meals).where(and(eq(meals.id, mealId), eq(meals.userId, session.user.id)));
  console.log(`Meal with ID ${mealId} deleted.`);
}