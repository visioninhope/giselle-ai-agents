ALTER TABLE "github_repository_content_status" DROP CONSTRAINT "gh_content_status_unique";--> statement-breakpoint
ALTER TABLE "github_repository_content_status" ADD COLUMN "embedding_profile_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "github_repository_content_status" ADD CONSTRAINT "gh_content_status_unique" UNIQUE("repository_index_db_id","embedding_profile_id","content_type");