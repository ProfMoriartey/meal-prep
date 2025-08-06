// src/components/plan/DailyMealPlanList.tsx
"use client";

import MealCard from "~/components/shared/MealCard";
import { deleteMealPlan } from "~/app/_actions/plans";
import { useRouter } from "next/navigation"; // Import useRouter for client-side navigation/refresh

// A type definition for the data passed to this component
interface DailyMealPlanListProps {
  dailyPlans: Array<{
    id: number;
    mealId: number;
    plannedDate: string;
    userId: string;
    meal: {
      id: number;
      name: string;
      image: string | null;
      description: string | null;
      userId: string;
      createdAt: Date;
      updatedAt: Date | null;
      meal_to_ingredients: Array<{
        ingredientId: number;
        mealId: number;
        quantity: string | null;
        ingredient: {
          id: number;
          name: string;
        };
      }>;
    };
  }>;
  // We need the current date string to revalidate the correct path
  currentDateString: string;
}

export default function DailyMealPlanList({
  dailyPlans,
}: DailyMealPlanListProps) {
  const router = useRouter();

  // Define the client-side handler that calls the server action
  const handleDeleteMealPlan = async (mealPlanId: number) => {
    if (window.confirm("Are you sure you want to delete this meal plan?")) {
      // Call the server action directly
      const result = await deleteMealPlan(mealPlanId);
      if (result.success) {
        // Refresh the current page to show updated data
        router.refresh();
      } else {
        alert(result.error);
      }
    }
  };

  return (
    <div className="space-y-4">
      {dailyPlans.length > 0 ? (
        dailyPlans.map((plan) => (
          <MealCard
            key={plan.id}
            meal={plan.meal}
            ingredients={plan.meal.meal_to_ingredients.map((mti) => ({
              name: mti.ingredient.name,
              quantity: mti.quantity ?? "N/A",
            }))}
            // Pass the client-side handler to the MealCard
            onDelete={() => handleDeleteMealPlan(plan.id)}
          />
        ))
      ) : (
        <p className="text-gray-500">No meals planned for this day.</p>
      )}
    </div>
  );
}
