"use server";

import { db } from "~/server/db";
import { meals, ingredients, meal_to_ingredients } from "~/server/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { createMealFormSchema, updateMealFormSchema } from "~/lib/zod";
import { auth } from "~/server/auth";
import { ZodError } from "zod";
import { revalidatePath } from "next/cache";

type FormState = {
  success?: string;
  error?: string;
};

// New function to fetch all meals for the current user
export async function getMeals() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  const userMeals = await db.query.meals.findMany({
    where: eq(meals.userId, session.user.id),
    with: {
      meal_to_ingredients: {
        with: {
          ingredient: true, // Fetch the actual ingredient details
        },
      },
    },
  });

  return userMeals;
}

// New function to fetch a single meal
export async function getMealById(mealId: number) {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const meal = await db.query.meals.findFirst({
    where: and(eq(meals.id, mealId), eq(meals.userId, session.user.id)),
    with: {
      meal_to_ingredients: {
        with: {
          ingredient: true,
        },
      },
    },
  });

  return meal;
}

export async function createMeal(prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in to create a meal." };
  }

  const ingredientsString = formData.get("ingredients") as string;
  const mealName = formData.get("mealName") as string;

  let ingredientData: unknown;
  try {
    // FIX: Explicitly cast JSON.parse result to unknown to satisfy linter
    ingredientData = JSON.parse(ingredientsString) as unknown;
  } catch (err: unknown) {
    // FIX: Ensure 'err' is used and handle non-Error instances
    if (err instanceof Error) {
      console.error("JSON parsing error:", err.message);
    } else {
      console.error("Unknown JSON parsing error:", err);
    }
    return { error: "Invalid ingredients format. Please provide a valid JSON array." };
  }

  const result = createMealFormSchema.safeParse({
    mealName: mealName,
    ingredients: ingredientData,
  });

  if (!result.success) {
    if (result.error instanceof ZodError) {
      const errorMessages = result.error.issues.map(err => err.message).join(", ");
      console.error("Zod validation failed:", errorMessages);
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

    revalidatePath("/meals"); // Revalidate the meals page after creating a meal
    return { success: "Meal created successfully!" };
  } catch (err) {
    console.error("Database transaction failed:", err);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

// New Server Action for updating a meal
export async function updateMeal(prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in to update a meal." };
  }

  const mealId = parseInt(formData.get("mealId") as string);
  const ingredientsString = formData.get("ingredients") as string;
  const mealName = formData.get("mealName") as string;

  let ingredientData: unknown;
  try {
    // FIX: Explicitly cast JSON.parse result to unknown to satisfy linter
    ingredientData = JSON.parse(ingredientsString) as unknown;
  } catch (err: unknown) {
    // FIX: Ensure 'err' is used and handle non-Error instances
    if (err instanceof Error) {
      console.error("JSON parsing error:", err.message);
    } else {
      console.error("Unknown JSON parsing error:", err);
    }
    return { error: "Invalid ingredients format." };
  }
  
  const result = updateMealFormSchema.safeParse({
    id: mealId,
    mealName: mealName,
    ingredients: ingredientData,
  });

  if (!result.success) {
    const errorMessages = result.error.issues.map(err => err.message).join(", ");
    return { error: `Validation failed: ${errorMessages}` };
  }

  const { data } = result;

  try {
    await db.transaction(async (tx) => {
      // First, update the meal's name
      await tx.update(meals)
        .set({ name: data.mealName })
        .where(and(eq(meals.id, data.id), eq(meals.userId, session.user.id)));
      
      // Then, manage the ingredients. A simple strategy is to delete all existing
      // and re-insert the new list.
      await tx.delete(meal_to_ingredients).where(eq(meal_to_ingredients.mealId, data.id));

      const ingredientNames = data.ingredients.map(item => item.name);
      
      const existingIngredients = await tx.query.ingredients.findMany({
        where: inArray(ingredients.name, ingredientNames),
      });

      const existingIngredientNames = new Set(existingIngredients.map(ing => ing.name));
      const newIngredientNames = ingredientNames.filter(name => !existingIngredientNames.has(name));

      if (newIngredientNames.length > 0) {
        await tx.insert(ingredients).values(newIngredientNames.map(name => ({ name })));
      }

      const allIngredients = await tx.query.ingredients.findMany({
        where: inArray(ingredients.name, ingredientNames),
      });

      const ingredientNameToIdMap = new Map(allIngredients.map(ing => [ing.name, ing.id]));

      const mealToIngredientsData = data.ingredients.map(item => ({
        mealId: data.id,
        ingredientId: ingredientNameToIdMap.get(item.name)!,
        quantity: item.quantity,
      }));

      await tx.insert(meal_to_ingredients).values(mealToIngredientsData);
    });

    revalidatePath("/meals");
    revalidatePath(`/meals/edit/${data.id}`); // Revalidate the edit page itself
    return { success: "Meal updated successfully!" };
  } catch (err) {
    return { error: "An unexpected error occurred during the update." };
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

  revalidatePath("/meals"); // Revalidate the meals page after deleting a meal
  return { success: `Meal with ID ${mealId} deleted.` };
}
