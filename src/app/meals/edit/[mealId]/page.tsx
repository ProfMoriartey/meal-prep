// src/app/meals/edit/[mealId]/page.tsx

import { getMealById } from "~/app/_actions/meals";
import { notFound } from "next/navigation";
import MealForm from "~/components/meals/MealForm";

interface EditMealPageProps {
  params: Promise<{
    mealId: string;
  }>;
}

export default async function EditMealPage({ params }: EditMealPageProps) {
  const mealId = parseInt((await params).mealId);
  const meal = await getMealById(mealId);

  if (!meal) {
    notFound(); // Display a 404 page if the meal is not found
  }

  // Format ingredients for the form
  const formattedIngredients = meal.meal_to_ingredients.map((mti) => ({
    name: mti.ingredient.name,
    quantity: mti.quantity ?? "",
  }));

  return (
    <div className="container mx-auto p-4">
      <MealForm initialMeal={{ ...meal, ingredients: formattedIngredients }} />
    </div>
  );
}
