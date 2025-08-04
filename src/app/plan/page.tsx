// src/app/plan/page.tsx

import { db } from "~/server/db";
import { meals, meal_plans } from "~/server/db/schema";
import { auth } from "~/server/auth";

export default async function MealPlanPage() {
  const session = await auth();
  if (!session?.user) {
    return <main>Please sign in</main>;
  }

  // Fetch meals from the user's library
  const mealLibrary = await db.query.meals.findMany({
    where: (t, { eq }) => eq(t.userId, session.user.id),
  });

  // Fetch scheduled meals for the current user
  const userMealPlans = await db.query.meal_plans.findMany({
    where: (t, { eq }) => eq(t.userId, session.user.id),
  });

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Your Monthly Meal Plan</h1>
      {/* The calendar component will be rendered here */}
    </main>
  );
}
