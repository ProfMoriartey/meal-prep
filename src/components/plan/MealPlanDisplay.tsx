"use client";

import { useEffect, useState } from "react";
import { getMealPlans, deleteMealPlan } from "~/app/_actions/plans";
import { format, isSameDay } from "date-fns";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { type MealPlan } from "~/lib/zod";

// A type definition for the data returned from `getMealPlans`
type MealPlanWithMeal = MealPlan & {
  meal: {
    id: number;
    name: string;
    image: string | null;
  };
};

export default function MealPlanDisplay({
  initialMealPlans,
}: {
  initialMealPlans: MealPlanWithMeal[];
}) {
  const [date, setDate] = useState<Date>(new Date());
  const [mealPlans, setMealPlans] =
    useState<MealPlanWithMeal[]>(initialMealPlans);
  const [loading, setLoading] = useState(false);

  // Function to fetch meal plans for the currently viewed month
  const fetchMealPlans = async (currentDate: Date) => {
    setLoading(true);
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    );
    const plans = await getMealPlans(startOfMonth, endOfMonth);
    setMealPlans(plans as MealPlanWithMeal[]); // Cast to the correct type
    setLoading(false);
  };

  // Fetch meal plans whenever the month changes
  useEffect(() => {
    const fetchData = async () => {
      await fetchMealPlans(date);
    };
    void fetchData();
  }, [date]);

  // Function to handle meal plan deletion
  const handleDelete = async (mealPlanId: number) => {
    if (window.confirm("Are you sure you want to delete this meal plan?")) {
      const result = await deleteMealPlan(mealPlanId);
      if (result.success) {
        await fetchMealPlans(date);
      } else {
        alert(result.error);
      }
    }
  };

  return (
    <section className="flex flex-col items-center rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
      <h2 className="mb-4 text-xl font-semibold">Your Planned Meals</h2>

      {loading ? (
        <p>Loading meal plans...</p>
      ) : (
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="w-full"
          required
          classNames={{
            day_selected:
              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            day_today: "bg-accent text-accent-foreground",
          }}
          components={{
            Day: ({ day }) => {
              const plannedMeal = mealPlans.find((plan) =>
                isSameDay(new Date(plan.plannedDate), day.date),
              );

              return (
                <div className="relative flex h-full w-full flex-col items-center justify-start p-1">
                  <div className="text-center font-bold">
                    {format(day.date, "d")}
                  </div>
                  {plannedMeal && (
                    <div className="mt-1 truncate text-center text-xs">
                      {plannedMeal.meal.name}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(plannedMeal.id)}
                        className="h-auto p-1"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-x-circle text-red-500"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="m15 9-6 6" />
                          <path d="m9 9 6 6" />
                        </svg>
                      </Button>
                    </div>
                  )}
                </div>
              );
            },
          }}
        />
      )}
    </section>
  );
}
