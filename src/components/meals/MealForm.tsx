// src/app/meals/create/MealForm.tsx
"use client";

import { useFormState } from "react-dom";
import { useState, useEffect } from "react";
import { createMeal, updateMeal } from "~/app/_actions/meals";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useRouter } from "next/navigation";

interface IngredientInput {
  name: string;
  quantity: string;
}

interface MealFormProps {
  initialMeal?: {
    id: number;
    name: string;
    description?: string | null;
    ingredients: IngredientInput[];
  };
}

const initialState = {
  success: undefined,
  error: undefined,
};

export default function MealForm({ initialMeal }: MealFormProps) {
  const router = useRouter();
  const isEditing = !!initialMeal;
  const action = isEditing ? updateMeal : createMeal;

  const [formState, formAction] = useFormState(action, initialState);
  const [mealName, setMealName] = useState(initialMeal?.name ?? "");
  const [ingredients, setIngredients] = useState<IngredientInput[]>(
    initialMeal?.ingredients ?? [{ name: "", quantity: "" }],
  );

  useEffect(() => {
    if (formState.success) {
      router.refresh(); // Revalidate data on successful submission
      if (!isEditing) {
        // Only reset form if creating a new meal
        setMealName("");
        setIngredients([{ name: "", quantity: "" }]);
      }
      // Optionally, navigate away after successful edit
      if (isEditing) {
        router.push("/meals");
      }
    }
  }, [formState.success, router, isEditing]);

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: "" }]);
  };

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const handleIngredientChange = (
    index: number,
    field: keyof IngredientInput,
    value: string,
  ) => {
    const newIngredients = [...ingredients];
    // FIX: Add non-null assertion to newIngredients[index]
    newIngredients[index]![field] = value;
    setIngredients(newIngredients);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("mealName", mealName);
    formData.set("ingredients", JSON.stringify(ingredients));
    if (isEditing) {
      formData.set("mealId", initialMeal.id.toString());
    }
    formAction(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-lg bg-white p-6 shadow-lg"
    >
      <h2 className="mb-4 text-2xl font-semibold">
        {isEditing ? `Edit Meal: ${initialMeal?.name}` : "Create New Meal"}
      </h2>

      <div>
        <Label htmlFor="mealName">Meal Name</Label>
        <Input
          id="mealName"
          name="mealName"
          type="text"
          value={mealName}
          onChange={(e) => setMealName(e.target.value)}
          placeholder="e.g., Chicken Stir-fry"
          required
        />
      </div>

      <div className="space-y-4">
        <Label>Ingredients</Label>
        {ingredients.map((ingredient, index) => (
          <div key={index} className="flex items-end gap-2">
            <div className="flex-1">
              <Label htmlFor={`ingredient-name-${index}`} className="sr-only">
                Ingredient Name
              </Label>
              <Input
                id={`ingredient-name-${index}`}
                type="text"
                value={ingredient.name}
                onChange={(e) =>
                  handleIngredientChange(index, "name", e.target.value)
                }
                placeholder="Ingredient Name (e.g., Chicken Breast)"
                required
              />
            </div>
            <div className="flex-1">
              <Label
                htmlFor={`ingredient-quantity-${index}`}
                className="sr-only"
              >
                Quantity
              </Label>
              <Input
                id={`ingredient-quantity-${index}`}
                type="text"
                value={ingredient.quantity}
                onChange={(e) =>
                  handleIngredientChange(index, "quantity", e.target.value)
                }
                placeholder="Quantity (e.g., 500g)"
                required
              />
            </div>
            {ingredients.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => handleRemoveIngredient(index)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-minus"
                >
                  <path d="M5 12h14" />
                </svg>
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" onClick={handleAddIngredient}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-plus mr-2"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
          Add Ingredient
        </Button>
      </div>

      {formState.error && (
        <p className="font-medium text-red-500">{formState.error}</p>
      )}
      {formState.success && (
        <p className="font-medium text-green-500">{formState.success}</p>
      )}

      <Button type="submit" className="w-full">
        {isEditing ? "Update Meal" : "Create Meal"}
      </Button>
    </form>
  );
}
