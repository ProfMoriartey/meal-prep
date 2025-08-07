'use server';

import { db } from "~/server/db";
import { meal_plans } from "~/server/db/schema";
import { and, eq, between } from "drizzle-orm";
import { auth } from "~/server/auth";
import { type DateRange } from "react-day-picker";
import { format } from "date-fns";

type IngredientItem = {
  name: string;
  quantity: string;
};

// New function to fetch all ingredients for a given date range
export async function getShoppingList(dateRange: DateRange): Promise<IngredientItem[]> {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  // Ensure a valid date range is provided
  if (!dateRange.from || !dateRange.to) {
    return [];
  }

  // Convert the Date objects to a 'YYYY-MM-DD' string format, which matches the database schema
  const startDate = format(dateRange.from, 'yyyy-MM-dd');
  const endDate = format(dateRange.to, 'yyyy-MM-dd');

  try {
    const plannedMeals = await db.query.meal_plans.findMany({
      where: and(
        eq(meal_plans.userId, session.user.id),
        between(meal_plans.plannedDate, startDate, endDate)
      ),
      with: {
        meal: {
          with: {
            meal_to_ingredients: {
              with: {
                ingredient: true,
              },
            },
          },
        },
      },
    });

    // An object to hold the aggregated ingredients
    const aggregatedIngredients: Record<string, { name: string; quantities: string[] }> = {};

    plannedMeals.forEach(plan => {
      plan.meal.meal_to_ingredients.forEach(item => {
        // Add checks to ensure both the ingredient name and quantity are strings before using them
        if (typeof item.ingredient.name !== 'string' || typeof item.quantity !== 'string') {
          return; // Skip this item if data is missing or invalid
        }
        
        const ingredientName = item.ingredient.name;
        const quantity = item.quantity;

        // Use the nullish coalescing operator to initialize the object if it doesn't exist
        aggregatedIngredients[ingredientName] ??= {
          name: ingredientName,
          quantities: [],
        };
        
        aggregatedIngredients[ingredientName].quantities.push(quantity);
      });
    });

    // Simple aggregation of quantities for demonstration
    const shoppingList: IngredientItem[] = Object.values(aggregatedIngredients).map(item => ({
      name: item.name,
      quantity: item.quantities.join(', '), // Joins quantities as a string
    }));

    return shoppingList;
  } catch (error) {
    console.error("Failed to fetch shopping list:", error);
    return [];
  }
}
