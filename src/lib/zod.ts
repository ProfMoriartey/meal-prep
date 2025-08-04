// src/lib/zod.ts

import { createSelectSchema } from "drizzle-zod";
import { meals, ingredients, meal_to_ingredients, meal_plans } from "~/server/db/schema";
import { z } from "zod";

export const mealSchema = createSelectSchema(meals);
export const ingredientSchema = createSelectSchema(ingredients);
export const mealToIngredientSchema = createSelectSchema(meal_to_ingredients);
export const mealPlanSchema = createSelectSchema(meal_plans);

export const createMealFormSchema = z.object({
  mealName: z.string().min(1, "Meal name is required."),
  ingredients: z.array(
    z.object({
      name: z.string().min(1, "Ingredient name is required."),
      quantity: z.string().min(1, "Quantity is required."),
    })
  ).min(1, "At least one ingredient is required."),
});

export type Meal = z.infer<typeof mealSchema>;
export type Ingredient = z.infer<typeof ingredientSchema>;
export type MealToIngredient = z.infer<typeof mealToIngredientSchema>;
export type MealPlan = z.infer<typeof mealPlanSchema>;