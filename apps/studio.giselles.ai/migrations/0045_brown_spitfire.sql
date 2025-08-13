CREATE TABLE "github_repository_embedding_profiles" (
	"repository_index_db_id" integer NOT NULL,
	"embedding_profile_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "gh_repo_emb_profiles_pk" PRIMARY KEY("repository_index_db_id","embedding_profile_id")
);
--> statement-breakpoint
ALTER TABLE "github_repository_embeddings" DROP CONSTRAINT "github_repository_embeddings_repository_index_db_id_path_chunk_index_unique";--> statement-breakpoint
ALTER TABLE "github_repository_pull_request_embeddings" DROP CONSTRAINT "gh_pr_emb_unique";--> statement-breakpoint
DROP INDEX "github_repository_embeddings_embedding_index";--> statement-breakpoint
DROP INDEX "github_repository_pull_request_embeddings_embedding_index";--> statement-breakpoint
ALTER TABLE "github_repository_embeddings" ALTER COLUMN "embedding" SET DATA TYPE vector;--> statement-breakpoint
ALTER TABLE "github_repository_pull_request_embeddings" ALTER COLUMN "embedding" SET DATA TYPE vector;--> statement-breakpoint
ALTER TABLE "github_repository_embeddings" ADD COLUMN "embedding_profile_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "github_repository_embeddings" ADD COLUMN "embedding_dimensions" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "github_repository_pull_request_embeddings" ADD COLUMN "embedding_profile_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "github_repository_pull_request_embeddings" ADD COLUMN "embedding_dimensions" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "github_repository_embedding_profiles" ADD CONSTRAINT "gh_repo_emb_profiles_repo_idx_fk" FOREIGN KEY ("repository_index_db_id") REFERENCES "public"."github_repository_index"("db_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "github_repository_embeddings_embedding_1536_idx" ON "github_repository_embeddings" USING hnsw ("embedding" vector_cosine_ops) WHERE "github_repository_embeddings"."embedding_dimensions" = 1536;--> statement-breakpoint
CREATE INDEX "github_repository_embeddings_embedding_3072_idx" ON "github_repository_embeddings" USING hnsw ("embedding" vector_cosine_ops) WHERE "github_repository_embeddings"."embedding_dimensions" = 3072;--> statement-breakpoint
CREATE INDEX "gh_pr_embeddings_embedding_1536_idx" ON "github_repository_pull_request_embeddings" USING hnsw ("embedding" vector_cosine_ops) WHERE "github_repository_pull_request_embeddings"."embedding_dimensions" = 1536;--> statement-breakpoint
CREATE INDEX "gh_pr_embeddings_embedding_3072_idx" ON "github_repository_pull_request_embeddings" USING hnsw ("embedding" vector_cosine_ops) WHERE "github_repository_pull_request_embeddings"."embedding_dimensions" = 3072;--> statement-breakpoint
ALTER TABLE "github_repository_embeddings" ADD CONSTRAINT "gh_repo_emb_unique" UNIQUE("repository_index_db_id","embedding_profile_id","path","chunk_index");--> statement-breakpoint
ALTER TABLE "github_repository_pull_request_embeddings" ADD CONSTRAINT "gh_pr_emb_unique" UNIQUE("repository_index_db_id","embedding_profile_id","pr_number","content_type","content_id","chunk_index");
