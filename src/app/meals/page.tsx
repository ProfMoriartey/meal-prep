// src/app/meals/page.tsx

import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { MealList } from "./_components/MealList";

export default async function MealsPage() {
  const session = await auth();
  if (!session?.user) {
    return <main>Please sign in</main>;
  }

  const allMeals = await db.query.meals.findMany({
    where: (t, { eq }) => eq(t.userId, session.user.id),
    with: {
      meal_to_ingredients: {
        with: {
          ingredient: true,
        },
      },
    },
  });

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Your Meal Library</h1>
      <MealList meals={allMeals} />
    </main>
  );
}
