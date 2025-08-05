"use client";

import { useFormState } from "react-dom";
import { useState, useEffect } from "react";
import { createMealPlan } from "~/app/_actions/plans";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { format } from "date-fns";
import { type Meal } from "~/lib/zod";
import { useRouter } from "next/navigation";

const initialState = {
  success: undefined,
  error: undefined,
};

export default function MealPlanConfig({ meals }: { meals: Meal[] }) {
  const router = useRouter();
  const [selectedMealId, setSelectedMealId] = useState<string | undefined>(
    undefined,
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );

  const [formState, formAction] = useFormState(createMealPlan, initialState);

  // Use a useEffect hook to watch for a successful form submission
  // This is still a good pattern to reset the form and show a success message
  useEffect(() => {
    if (formState.success) {
      // Reset form state for a better user experience
      setSelectedMealId(undefined);
      setSelectedDate(new Date());
    }
  }, [formState.success]);

  // Helper function to handle form submission
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedMealId || !selectedDate) {
      // FIX: Replace alert with a more user-friendly UI component if needed.
      alert("Please select a meal and a date.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    formData.set("mealId", selectedMealId);
    formData.set("plannedDate", format(selectedDate, "yyyy-MM-dd"));
    formAction(formData);

    // FIX: Instead of calling router.refresh() here, we will trust the Server Action's revalidatePath
    // to handle the data invalidation. The UI will re-render correctly on the next fetch.
    // The calendar in the display component handles its own data fetching.
  };

  return (
    <section className="mb-8 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
      <h2 className="mb-4 text-xl font-semibold">Add a Meal to Your Plan</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="mealSelector">Select a Meal</Label>
          <Select
            onValueChange={setSelectedMealId}
            value={selectedMealId}
            name="mealId"
          >
            <SelectTrigger id="mealSelector" className="w-full">
              <SelectValue placeholder="Choose a meal" />
            </SelectTrigger>
            <SelectContent>
              {meals.map((meal) => (
                <SelectItem key={meal.id} value={meal.id.toString()}>
                  {meal.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="datePicker">Select a Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-full justify-start text-left font-normal"
              >
                {selectedDate ? (
                  format(selectedDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {formState.error && (
          <p className="font-medium text-red-500">{formState.error}</p>
        )}
        {formState.success && (
          <p className="font-medium text-green-500">{formState.success}</p>
        )}

        <Button type="submit" className="w-full">
          Add to Plan
        </Button>
      </form>
    </section>
  );
}
