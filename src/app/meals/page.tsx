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
