import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { deleteMeal } from "../_actions/meals";
import { revalidatePath } from "next/cache";
import MealCard from "~/components/shared/MealCard";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { PlusCircle } from "lucide-react";

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

  const handleMealDelete = async (mealId: number) => {
    "use server";
    await deleteMeal(mealId);
    revalidatePath("/meals");
  };

  return (
    <main className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Meal Library</h1>
        <Link href="/meals/create" passHref>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Meal
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {allMeals.length > 0 ? (
          allMeals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              // Map the meal_to_ingredients to the format expected by MealCard
              ingredients={meal.meal_to_ingredients.map((mti) => ({
                name: mti.ingredient.name,
                quantity: mti.quantity ?? "N/A", // Provide a fallback for quantity
              }))}
              onDelete={handleMealDelete}
            />
          ))
        ) : (
          <p>No meals found. Create one to get started.</p>
        )}
      </div>
    </main>
  );
}
