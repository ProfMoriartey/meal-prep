DROP INDEX "t_user_id_idx";--> statement-breakpoint
ALTER TABLE "meal-prep_user" ALTER COLUMN "emailVerified" DROP DEFAULT;--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "meal-prep_session" USING btree ("userId");