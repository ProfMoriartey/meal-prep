// src/app/plan/page.tsx

import { getMealPlans } from "~/app/_actions/plans";
import MealPlanDisplay from "~/components/plan/MealPlanDisplay";

export default async function PlanPage() {
  // We will need to fetch the initial meal plans to display them on the calendar.
  // The client component will handle subsequent fetches.
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  const initialMealPlans = await getMealPlans(oneMonthAgo, oneYearFromNow);

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-3xl font-bold">Plan Your Meals</h1>

      {/* Display Section */}
      <MealPlanDisplay initialMealPlans={initialMealPlans} />
    </div>
  );
}
