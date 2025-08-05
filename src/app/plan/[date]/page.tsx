// app/plan/[date]/page.tsx

import { getMealPlans } from "~/app/_actions/plans";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { format } from "date-fns";

interface DailyPlanPageProps {
  params: Promise<{
    date: string;
  }>;
}

export default async function DailyPlanPage({ params }: DailyPlanPageProps) {
  const { date } = await Promise.resolve(params);

  const selectedDate = new Date(`${date}T00:00:00Z`);

  // 🧪 Debug: log the incoming route param and parsed date
  console.log("📅 Route param:", date);
  console.log("🕒 Parsed selectedDate:", selectedDate.toISOString());

  // ✅ Call server action
  const dailyPlans = await getMealPlans(selectedDate, selectedDate);

  // 🧪 Debug: check returned plans
  console.log("📦 Fetched plans:", dailyPlans);

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
        <div>
          <h1 className="text-3xl font-bold">
            Meals for {format(selectedDate, "PPP")}
          </h1>
          {/* <p className="text-muted-foreground text-sm">
            Raw Date: {selectedDate.toISOString()}
          </p> */}
        </div>
      </div>

      <div className="space-y-4">
        {dailyPlans.length > 0 ? (
          dailyPlans.map((plan) => (
            <div key={plan.id} className="rounded-lg border p-4 shadow-sm">
              <h2 className="text-xl font-semibold">{plan.meal.name}</h2>
              {/* Optional: Show meal image if exists */}
              {plan.meal.image && (
                <img
                  src={plan.meal.image}
                  alt={plan.meal.name}
                  className="mt-2 max-h-40 rounded-md object-cover"
                />
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500">No meals planned for this day.</p>
        )}
      </div>
    </div>
  );
}
