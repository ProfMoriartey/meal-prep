"use client";

import { type MealWithIngredients } from "~/lib/types";
import { deleteMeal } from "~/app/_actions/meals";

export function MealList({ meals }: { meals: MealWithIngredients[] }) {
  const handleDelete = async (mealId: number) => {
    await deleteMeal(mealId);
    // You will need to refresh the page to see the changes. We can add a better solution later.
    window.location.reload();
  };

  return (
    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {meals.map((meal) => (
        <div key={meal.id} className="rounded-md border p-4 shadow">
          <h2 className="text-xl font-semibold">{meal.name}</h2>
          <div className="mt-2 text-sm text-gray-600">
            <p>Ingredients:</p>
            <ul className="list-inside list-disc">
              {meal.meal_to_ingredients.map((item) => (
                <li key={item.ingredient.id}>
                  {item.quantity} {item.ingredient.name}
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={() => handleDelete(meal.id)}
            className="mt-4 rounded-md bg-red-500 px-4 py-2 text-white"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
