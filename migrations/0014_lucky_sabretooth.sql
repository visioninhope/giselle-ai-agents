ALTER TABLE "agents" ADD COLUMN "creator_db_id" integer NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agents" ADD CONSTRAINT "agents_creator_db_id_users_db_id_fk" FOREIGN KEY ("creator_db_id") REFERENCES "public"."users"("db_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
