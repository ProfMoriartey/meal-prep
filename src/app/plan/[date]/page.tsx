// src/app/plan/[date]/page.tsx

import { getMealPlans } from "~/app/_actions/plans"; // Using getMealPlans for data fetching
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import DailyMealPlanList from "~/components/plan/DailyMealPlanList"; // Import the new client component

interface DailyPlanPageProps {
  params: Promise<{
    date: string;
  }>;
}

export default async function DailyPlanPage({ params }: DailyPlanPageProps) {
  const selectedDate = new Date(`${(await params).date}T00:00:00Z`);
  const selectedDateString = (await params).date; // Keep the string format for passing to client component

  // Fetch meals for the specific day using getMealPlans
  // It's configured to fetch nested meal_to_ingredients and ingredient data
  const dailyPlans = await getMealPlans(selectedDate, selectedDate);

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/plan" passHref>
          <Button variant="ghost">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-arrow-left mr-2"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            Back to Calendar
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">
          Meals for {format(selectedDate, "PPP")}
        </h1>
      </div>

      {/* Render the new client component and pass the data */}
      <DailyMealPlanList
        dailyPlans={dailyPlans}
        currentDateString={selectedDateString}
      />
    </div>
  );
}
