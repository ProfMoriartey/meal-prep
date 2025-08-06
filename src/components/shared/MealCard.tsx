"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import Link from "next/link"; // Import Link

interface MealCardProps {
  meal: {
    id: number;
    name: string;
    description?: string | null;
  };
  ingredients?: { name: string; quantity: string }[];
  onDelete: (mealId: number) => Promise<void>;
}

export default function MealCard({
  meal,
  ingredients,
  onDelete,
}: MealCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{meal.name}</CardTitle>
        {meal.description && (
          <CardDescription>{meal.description}</CardDescription>
        )}
      </CardHeader>

      {ingredients && ingredients.length > 0 && (
        <CardContent>
          <h4 className="mb-2 text-sm font-semibold">Ingredients</h4>
          <ul className="list-inside list-disc space-y-1">
            {ingredients.map((ingredient, index) => (
              <li key={index} className="text-sm">
                {ingredient.name} ({ingredient.quantity})
              </li>
            ))}
          </ul>
        </CardContent>
      )}

      <CardFooter className="mt-auto flex justify-end gap-2">
        <Link href={`/meals/edit/${meal.id}`} passHref>
          <Button variant="outline" size="sm">
            Edit
          </Button>
        </Link>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(meal.id)}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
