"use client";

import { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { type MealPlan } from "~/lib/zod";
import { type CalendarDay, type Modifiers } from "react-day-picker";

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

export default function MealPlanDisplay({
  initialMealPlans,
}: {
  initialMealPlans: MealPlanWithMeal[];
}) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  return (
    <section className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <Button onClick={handlePrevMonth} variant="ghost" size="sm">
          &lt; Prev
        </Button>
        <h2 className="text-xl font-semibold">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <Button onClick={handleNextMonth} variant="ghost" size="sm">
          Next &gt;
        </Button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-2 text-center font-medium text-gray-500">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {daysInMonth.map((day) => (
          <DayCell
            key={day.toISOString()}
            day={day}
            plannedMeals={initialMealPlans}
          />
        ))}
      </div>
    </section>
  );
}
