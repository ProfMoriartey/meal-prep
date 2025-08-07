"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import { type DateRange } from "react-day-picker";
import { getShoppingList } from "~/app/_actions/shopping";

type IngredientItem = {
  name: string;
  quantity: string;
};

export default function ShoppingListPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [shoppingList, setShoppingList] = useState<IngredientItem[] | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  const fetchShoppingList = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      setShoppingList(null);
      return;
    }

    setIsLoading(true);
    try {
      const list = await getShoppingList(dateRange);
      setShoppingList(list);
    } catch (error) {
      console.error("Failed to fetch shopping list:", error);
      setShoppingList(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">Shopping List</h1>
      <div className="mb-6 flex flex-col items-center gap-4 md:flex-row">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-[300px] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        <Button
          onClick={fetchShoppingList}
          disabled={!dateRange?.from || !dateRange?.to || isLoading}
        >
          {isLoading ? "Generating..." : "Generate List"}
        </Button>
      </div>

      {isLoading && (
        <div className="flex h-40 items-center justify-center">
          <p className="text-gray-500">Generating your list...</p>
        </div>
      )}

      {shoppingList && shoppingList.length > 0 && (
        <div className="mt-6 space-y-4">
          <h2 className="text-2xl font-semibold">Your Ingredients</h2>
          <ul className="rounded-lg bg-white p-4 shadow-sm">
            {shoppingList.map((item, index) => (
              <li
                key={index}
                className="flex items-center justify-between border-b py-2 last:border-b-0"
              >
                <span className="text-lg font-medium">{item.name}</span>
                <span className="text-gray-600">{item.quantity}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {shoppingList && shoppingList.length === 0 && (
        <div className="mt-6 text-center text-gray-500">
          <p>No ingredients found for the selected date range.</p>
        </div>
      )}
    </div>
  );
}
