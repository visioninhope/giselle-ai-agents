ALTER TABLE "user_seat_usage_reports" ADD COLUMN "value" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "user_seat_usage_reports" ADD COLUMN "is_delta" boolean NOT NULL;