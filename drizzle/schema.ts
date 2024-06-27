import { sql } from "@vercel/postgres";
import {
	pgTable,
	serial,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/vercel-postgres";

export const workflows = pgTable(
	"workflows",
	{
		id: serial("id").primaryKey(),
		slug: text("slug").notNull(),
		createdAt: timestamp("createdAt").defaultNow().notNull(),
	},
	(workflows) => {
		return {
			uniqueIdx: uniqueIndex("unique_idx").on(workflows.slug),
		};
	},
);
