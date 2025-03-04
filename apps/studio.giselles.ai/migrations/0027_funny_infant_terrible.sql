DROP TABLE "builds";--> statement-breakpoint
DROP TABLE "edges";--> statement-breakpoint
DROP TABLE "file_openai_file_representations";--> statement-breakpoint
DROP TABLE "files";--> statement-breakpoint
DROP TABLE "github_integrations";--> statement-breakpoint
DROP TABLE "knowledge_content_openai_vector_store_file_representations";--> statement-breakpoint
DROP TABLE "knowledge_contents";--> statement-breakpoint
DROP TABLE "knowledge_openai_vector_store_representations";--> statement-breakpoint
DROP TABLE "knowledges";--> statement-breakpoint
DROP TABLE "nodes";--> statement-breakpoint
DROP TABLE "ports";--> statement-breakpoint
DROP TABLE "request_port_messages";--> statement-breakpoint
DROP TABLE "request_results";--> statement-breakpoint
DROP TABLE "request_runners";--> statement-breakpoint
DROP TABLE "request_stack_runners";--> statement-breakpoint
DROP TABLE "request_stacks";--> statement-breakpoint
DROP TABLE "request_steps";--> statement-breakpoint
DROP TABLE "requests";--> statement-breakpoint
DROP TABLE "trigger_nodes";--> statement-breakpoint
ALTER TABLE "agents" DROP CONSTRAINT "agents_graph_hash_unique";--> statement-breakpoint
ALTER TABLE "agents" DROP COLUMN IF EXISTS "graphv2";--> statement-breakpoint
ALTER TABLE "agents" DROP COLUMN IF EXISTS "graph";--> statement-breakpoint
ALTER TABLE "agents" DROP COLUMN IF EXISTS "graph_hash";