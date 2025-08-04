import { AuthButton } from "~/components/auth-button";

export default function HomePage() {
  return (
    <main className="container mx-auto p-4 text-center">
      <h1 className="text-4xl font-bold">Welcome to Meal Prep</h1>
      <p className="mt-4 text-gray-600">Your personal meal planner.</p>
      <div className="mt-8">
        <AuthButton />
      </div>
    </main>
  );
}
