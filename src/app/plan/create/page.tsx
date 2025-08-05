// src/app/plan/create/page.tsx

import { getMeals } from "~/app/_actions/meals";
import { getMealPlans } from "~/app/_actions/plans";
import MealPlanConfig from "~/components/plan/MealPlanConfig";
import MealPlanDisplay from "~/components/plan/MealPlanDisplay";

export default async function CreatePlanPage() {
  const initialMeals = await getMeals();

  // We will need to fetch the initial meal plans to display them on the calendar.
  // The client component will handle subsequent fetches.
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  const initialMealPlans = await getMealPlans(oneMonthAgo, oneYearFromNow);

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-3xl font-bold">Create a New Meal Plan</h1>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Configuration Section */}
        <MealPlanConfig meals={initialMeals} />

        {/* Display Section */}
        <MealPlanDisplay initialMealPlans={initialMealPlans} />
      </div>
    </div>
  );
}
