CREATE TABLE "github_repository_content_status" (
	"db_id" serial PRIMARY KEY NOT NULL,
	"repository_index_db_id" integer NOT NULL,
	"content_type" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"status" text DEFAULT 'idle' NOT NULL,
	"last_synced_at" timestamp,
	"metadata" jsonb,
	"error_code" text,
	"retry_after" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "github_repository_content_status_repository_index_db_id_content_type_unique" UNIQUE("repository_index_db_id","content_type")
);
--> statement-breakpoint
CREATE TABLE "github_repository_pull_request_embeddings" (
	"db_id" serial PRIMARY KEY NOT NULL,
	"repository_index_db_id" integer NOT NULL,
	"pr_number" integer NOT NULL,
	"pr_merged_at" timestamp NOT NULL,
	"content_type" text NOT NULL,
	"content_id" text NOT NULL,
	"document_key" text NOT NULL,
	"embedding" vector(1536) NOT NULL,
	"chunk_content" text NOT NULL,
	"chunk_index" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "github_repository_pull_request_embeddings_repository_index_db_id_pr_number_content_type_content_id_chunk_index_unique" UNIQUE("repository_index_db_id","pr_number","content_type","content_id","chunk_index")
);
--> statement-breakpoint
ALTER TABLE "github_repository_content_status" ADD CONSTRAINT "github_repository_content_status_repository_index_db_id_github_repository_index_db_id_fk" FOREIGN KEY ("repository_index_db_id") REFERENCES "public"."github_repository_index"("db_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "github_repository_pull_request_embeddings" ADD CONSTRAINT "github_repository_pull_request_embeddings_repository_index_db_id_github_repository_index_db_id_fk" FOREIGN KEY ("repository_index_db_id") REFERENCES "public"."github_repository_index"("db_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "github_repository_pull_request_embeddings_embedding_index" ON "github_repository_pull_request_embeddings" USING hnsw ("embedding" vector_cosine_ops);