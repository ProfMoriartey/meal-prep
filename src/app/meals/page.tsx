// src/app/meals/page.tsx

import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { deleteMeal } from "../_actions/meals";
import { revalidatePath } from "next/cache";
import MealCard from "~/components/shared/MealCard";

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
      <h1 className="text-2xl font-bold">Your Meal Library</h1>
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

      {/* <MealList meals={allMeals} /> */}
    </main>
  );
}

// // Temporarily replace your meals/page.tsx with this simpler version
// import { auth } from "~/server/auth";

// export default async function MealsPage() {
//   console.log("Meals page: Starting auth check...");

//   try {
//     const session = await auth();
//     console.log(
//       "Meals page: Auth result:",
//       session ? "Session found" : "No session",
//     );

//     if (!session?.user) {
//       return (
//         <main className="container mx-auto p-4">
//           <h1 className="text-2xl font-bold">Please sign in</h1>
//           <a
//             href="/api/auth/signin"
//             className="rounded bg-blue-500 px-4 py-2 text-white"
//           >
//             Sign In
//           </a>
//         </main>
//       );
//     }

//     return (
//       <main className="container mx-auto p-4">
//         <h1 className="text-2xl font-bold">
//           Welcome, {session.user.name || session.user.email}!
//         </h1>
//         <p>User ID: {session.user.id}</p>
//         <pre className="mt-4 rounded bg-gray-100 p-4">
//           {JSON.stringify(session, null, 2)}
//         </pre>
//         {/* Temporarily remove database query to isolate the auth issue */}
//       </main>
//     );
//   } catch (error) {
//     console.error("Meals page error:", error);
//     return (
//       <main className="container mx-auto p-4">
//         <h1 className="text-2xl font-bold text-red-600">Error</h1>
//         <p>There was an error loading the page.</p>
//         <pre className="mt-4 rounded bg-red-100 p-4">
//           {error instanceof Error ? error.message : String(error)}
//         </pre>
//       </main>
//     );
//   }
// }
