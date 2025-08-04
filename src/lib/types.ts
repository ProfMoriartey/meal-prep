// src/lib/types.ts

// Type for the ingredient data used in the form
export type Ingredient = {
  name: string;
  quantity: string;
};

// Type for the meal data fetched from the database
export type Meal = {
  id: number;
  name: string;
  image?: string | null;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date | null;
};

// Type for an ingredient with its quantity from the join table
export type IngredientWithQuantity = {
  ingredient: {
    id: number;
    name: string;
  };
  quantity: string | null;
};

// Type for a meal with its full list of ingredients
export type MealWithIngredients = Meal & {
  meal_to_ingredients: IngredientWithQuantity[];
};