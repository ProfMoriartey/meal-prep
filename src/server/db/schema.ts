import { relations, sql } from "drizzle-orm";
import {
  index,
  pgTableCreator,
  primaryKey,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `meal-prep_${name}`);

// Next-Auth Tables
export const users = createTable("user", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }),
  email: d.varchar({ length: 255 }).notNull(),
  emailVerified: d.timestamp({
    mode: "date",
    withTimezone: true,
  }), // Removed .default() - this should be nullable without default
  image: d.varchar({ length: 255 }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  meals: many(meals),
  meal_plans: many(meal_plans),
}));

export const accounts = createTable(
  "account",
  (d) => ({
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: d.varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
    provider: d.varchar({ length: 255 }).notNull(),
    providerAccountId: d.varchar({ length: 255 }).notNull(),
    refresh_token: d.text(),
    access_token: d.text(),
    expires_at: d.integer(),
    token_type: d.varchar({ length: 255 }),
    scope: d.varchar({ length: 255 }),
    id_token: d.text(),
    session_state: d.varchar({ length: 255 }),
  }),
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index("account_user_id_idx").on(t.userId),
  ],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  (d) => ({
    sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [index("session_user_id_idx").on(t.userId)], // Fixed index name
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  (d) => ({
    identifier: d.varchar({ length: 255 }).notNull(),
    token: d.varchar({ length: 255 }).notNull(),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

// New Meal Planner Tables
export const meals = createTable("meal", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  userId: d
    .varchar({ length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: d.varchar({ length: 256 }).notNull(),
  image: d.varchar({ length: 255 }),
  description: d.text(),
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const mealsRelations = relations(meals, ({ many, one }) => ({
  user: one(users, { fields: [meals.userId], references: [users.id] }),
  meal_to_ingredients: many(meal_to_ingredients),
  meal_plans: many(meal_plans),
}));

export const ingredients = createTable("ingredient", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  name: d.varchar({ length: 256 }).notNull().unique(),
}));

export const ingredientsRelations = relations(ingredients, ({ many }) => ({
  meal_to_ingredients: many(meal_to_ingredients),
}));

export const meal_to_ingredients = createTable(
  "meal_to_ingredient",
  (d) => ({
    mealId: d
      .integer()
      .notNull()
      .references(() => meals.id, { onDelete: "cascade" }),
    ingredientId: d
      .integer()
      .notNull()
      .references(() => ingredients.id, { onDelete: "cascade" }),
    quantity: d.varchar({ length: 256 }),
  }),
  (t) => [primaryKey({ columns: [t.mealId, t.ingredientId] })],
);

export const meal_to_ingredientsRelations = relations(
  meal_to_ingredients,
  ({ one }) => ({
    meal: one(meals, {
      fields: [meal_to_ingredients.mealId],
      references: [meals.id],
    }),
    ingredient: one(ingredients, {
      fields: [meal_to_ingredients.ingredientId],
      references: [ingredients.id],
    }),
  }),
);

export const meal_plans = createTable(
  "meal_plan",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    mealId: d
      .integer()
      .notNull()
      .references(() => meals.id, { onDelete: "cascade" }),
    plannedDate: d.date("planned_date").notNull(),
  }),
  (t) => [
    index("meal_plan_user_id_idx").on(t.userId),
    index("meal_plan_meal_id_idx").on(t.mealId),
  ],
);

export const meal_plansRelations = relations(meal_plans, ({ one }) => ({
  user: one(users, {
    fields: [meal_plans.userId],
    references: [users.id],
  }),
  meal: one(meals, {
    fields: [meal_plans.mealId],
    references: [meals.id],
  }),
}));