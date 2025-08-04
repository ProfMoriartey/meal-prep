import { MealForm } from "./MealForm";

export default function CreateMealPage() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Create New Meal</h1>
      <MealForm />
    </main>
  );
}
