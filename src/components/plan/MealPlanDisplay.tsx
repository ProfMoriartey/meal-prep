"use client";

import { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  getDay, // Import getDay to get the day of the week (0 for Sunday, 1 for Monday, etc.)
  subMonths,
  addMonths,
  startOfWeek,
  endOfWeek,
  subWeeks,
  addWeeks,
} from "date-fns";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { type MealPlan } from "~/lib/zod";

// A type definition for the data returned from `getMealPlans`
type MealPlanWithMeal = MealPlan & {
  meal: {
    id: number;
    name: string;
    image: string | null;
  };
};

// Helper component for a custom day cell
const DayCell = ({
  day,
  plannedMeals,
}: {
  day: Date;
  plannedMeals: MealPlanWithMeal[];
}) => {
  const mealsForDay = plannedMeals.filter((plan) =>
    isSameDay(new Date(plan.plannedDate), day),
  );

  return (
    <Link
      href={`/plan/${format(day, "yyyy-MM-dd")}`}
      className="h-24 w-full rounded-md border p-2 transition-colors duration-150 hover:bg-gray-100"
    >
      <div className="text-sm font-bold text-gray-700">{format(day, "d")}</div>
      <div className="mt-1 space-y-1">
        {mealsForDay.map((plan) => (
          <div
            key={plan.id}
            className="truncate rounded-sm bg-blue-100 px-1 text-xs text-blue-800"
          >
            {plan.meal.name}
          </div>
        ))}
      </div>
    </Link>
  );
};

// Helper component for a vertical weekly day cell
const WeeklyDayCell = ({
  day,
  plannedMeals,
}: {
  day: Date;
  plannedMeals: MealPlanWithMeal[];
}) => {
  const mealsForDay = plannedMeals.filter((plan) =>
    isSameDay(new Date(plan.plannedDate), day),
  );

  return (
    <div className="flex flex-col items-center border-b p-4 transition-colors duration-150 last:border-b-0 hover:bg-gray-100 md:flex-row">
      <Link
        href={`/plan/${format(day, "yyyy-MM-dd")}`}
        className="mb-2 w-full flex-shrink-0 text-lg font-bold text-gray-700 md:mb-0 md:w-32"
      >
        {format(day, "EEEE, d")}
      </Link>
      <div className="w-full flex-grow space-y-2">
        {mealsForDay.length > 0 ? (
          mealsForDay.map((plan) => (
            <Link
              href={`/plan/${format(day, "yyyy-MM-dd")}`}
              key={plan.id}
              className="block truncate rounded-lg bg-blue-100 p-2 text-sm text-blue-800"
            >
              {plan.meal.name}
            </Link>
          ))
        ) : (
          <Link
            href={`/plan/${format(day, "yyyy-MM-dd")}`}
            className="block rounded-lg p-2 text-sm text-gray-500"
          >
            No meals planned.
          </Link>
        )}
      </div>
    </div>
  );
};

export default function MealPlanDisplay({
  initialMealPlans,
}: {
  initialMealPlans: MealPlanWithMeal[];
}) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<"monthly" | "weekly">("monthly");

  const daysInView = useMemo(() => {
    let start: Date;
    let end: Date;

    if (view === "monthly") {
      start = startOfMonth(currentDate);
      end = endOfMonth(currentDate);
    } else {
      // weekly view
      // Set the start of the week to Sunday
      start = startOfWeek(currentDate, { weekStartsOn: 0 });
      end = endOfWeek(currentDate, { weekStartsOn: 0 });
    }

    const startDay = getDay(start);
    const emptyCells = Array.from({ length: startDay }, (_, i) => (
      <div key={`empty-${i}`} className="h-24 w-full" />
    ));

    const actualDays = eachDayOfInterval({ start, end }).map((day) =>
      view === "monthly" ? (
        <DayCell
          key={day.toISOString()}
          day={day}
          plannedMeals={initialMealPlans}
        />
      ) : (
        <WeeklyDayCell
          key={day.toISOString()}
          day={day}
          plannedMeals={initialMealPlans}
        />
      ),
    );

    if (view === "weekly") {
      return actualDays;
    }

    return [...emptyCells, ...actualDays];
  }, [currentDate, initialMealPlans, view]);

  const handlePrev = () => {
    setCurrentDate((prevDate) =>
      view === "monthly" ? subMonths(prevDate, 1) : subWeeks(prevDate, 1),
    );
  };

  const handleNext = () => {
    setCurrentDate((prevDate) =>
      view === "monthly" ? addMonths(prevDate, 1) : addWeeks(prevDate, 1),
    );
  };

  const toggleView = () => {
    setView((prevView) => (prevView === "monthly" ? "weekly" : "monthly"));
  };

  return (
    <section className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
      <div className="mb-4 flex flex-col items-center justify-between md:flex-row">
        <div className="mb-2 flex items-center md:mb-0">
          <Button onClick={handlePrev} variant="ghost" size="sm">
            &lt; Prev
          </Button>
          <h2 className="mx-4 text-xl font-semibold">
            {format(
              currentDate,
              view === "monthly" ? "MMMM yyyy" : "MMMM d, yyyy",
            )}
          </h2>
          <Button onClick={handleNext} variant="ghost" size="sm">
            Next &gt;
          </Button>
        </div>
        <div className="flex">
          <Button
            onClick={() => setView("monthly")}
            variant={view === "monthly" ? "default" : "outline"}
            size="sm"
            className="rounded-r-none"
          >
            Monthly
          </Button>
          <Button
            onClick={() => setView("weekly")}
            variant={view === "weekly" ? "default" : "outline"}
            size="sm"
            className="rounded-l-none border-l-0"
          >
            Weekly
          </Button>
        </div>
      </div>

      {view === "monthly" && (
        <div className="mb-2 grid grid-cols-7 gap-2 text-center font-medium text-gray-500">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>
      )}

      <div
        className={
          view === "monthly" ? "grid grid-cols-7 gap-2" : "flex flex-col gap-2"
        }
      >
        {daysInView}
      </div>
    </section>
  );
}
