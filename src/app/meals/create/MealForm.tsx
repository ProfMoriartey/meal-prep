"use client";

import { useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createMeal } from "~/app/_actions/meals";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { type Ingredient } from "~/lib/types";

type FormState = {
  success?: string;
  error?: string;
};

const initialState: FormState = {
  success: undefined,
  error: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" aria-disabled={pending}>
      {pending ? "Creating..." : "Create Meal"}
    </Button>
  );
}

export function MealForm() {
  const [state, formAction] = useActionState<FormState, FormData>(
    createMeal,
    initialState,
  );
  const [mealName, setMealName] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", quantity: "" },
  ]);

  const handleIngredientChange = (
    index: number,
    field: keyof Ingredient,
    value: string,
  ) => {
    const newIngredients = [...ingredients];
    const ingredientToUpdate = newIngredients[index];

    if (ingredientToUpdate) {
      ingredientToUpdate[field] = value;
      setIngredients(newIngredients);
    }
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: "" }]);
  };

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const filteredIngredients = ingredients.filter(
      (item) => item.name.trim() !== "" && item.quantity.trim() !== "",
    );
    const formData = new FormData(e.currentTarget);
    formData.append("ingredients", JSON.stringify(filteredIngredients));
    formAction(formData);
    setMealName("");
    setIngredients([{ name: "", quantity: "" }]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {state?.success && (
        <div className="rounded-md bg-green-100 p-2 text-green-700">
          {state.success}
        </div>
      )}
      {state?.error && (
        <div className="rounded-md bg-red-100 p-2 text-red-700">
          {state.error}
        </div>
      )}
      <div>
        <Label htmlFor="mealName">Meal Name</Label>
        <Input
          id="mealName"
          name="mealName"
          value={mealName}
          onChange={(e) => setMealName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Ingredients</Label>
        {ingredients.map((ingredient, index) => (
          <div key={index} className="flex space-x-2">
            <Input
              placeholder="Ingredient Name"
              value={ingredient.name}
              onChange={(e) =>
                handleIngredientChange(index, "name", e.target.value)
              }
            />
            <Input
              placeholder="Quantity"
              value={ingredient.quantity}
              onChange={(e) =>
                handleIngredientChange(index, "quantity", e.target.value)
              }
            />
            <Button
              type="button"
              onClick={() => handleRemoveIngredient(index)}
              variant="outline"
            >
              Remove
            </Button>
          </div>
        ))}
        <Button type="button" onClick={handleAddIngredient} variant="outline">
          Add Ingredient
        </Button>
      </div>

      <SubmitButton />
    </form>
  );
}
