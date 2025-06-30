ALTER TABLE "github_repository_index" ADD COLUMN "error_code" text;--> statement-breakpoint
ALTER TABLE "github_repository_index" ADD COLUMN "is_retryable" boolean;