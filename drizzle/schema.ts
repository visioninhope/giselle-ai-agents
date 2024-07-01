import { relations } from "drizzle-orm";
import {
	integer,
	jsonb,
	pgTable,
	serial,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";

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
// export const workflowsRelations = relations(workflows, ({ many }) => ({
// 	nodes2: many(nodesSchema),
// 	edges: many(edges),
// }));

export const nodesSchema = pgTable("nodes", {
	id: serial("id").primaryKey(),
	type: text("type").notNull(),
	workflowId: integer("workflowId").references(() => workflows.id),
	position: jsonb("position").$type<{ x: number; y: number }>().notNull(),
	createdAt: timestamp("createdAt").defaultNow().notNull(),
});
const nodesRelations = relations(nodesSchema, ({ one }) => ({
	workflow: one(workflows, {
		fields: [nodesSchema.workflowId],
		references: [workflows.id],
	}),
}));

export const edges = pgTable("edges", {
	id: serial("id").primaryKey(),
	workflowId: integer("workflowId").references(() => workflows.id),
	sourceNodeId: integer("sourceNodeId").references(() => nodesSchema.id),
	sourceHandleId: text("sourceHandleId"),
	targetNodeId: integer("targetNodeId").references(() => nodesSchema.id),
	targetHandleId: text("targetHandleId"),
	createdAt: timestamp("createdAt").defaultNow().notNull(),
});
// const edgesRelations = relations(edges, ({ one }) => ({
// 	workflow: one(workflows, {
// 		fields: [edges.workflowId],
// 		references: [workflows.id],
// 	}),
// }));
export const users = pgTable("users", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
});
export const usersRelations = relations(users, ({ many }) => ({
	posts: many(posts),
}));
export const posts = pgTable("posts", {
	id: serial("id").primaryKey(),
	content: text("content").notNull(),
	authorId: integer("author_id").notNull(),
});
export const postsRelations = relations(posts, ({ one }) => ({
	author: one(users, { fields: [posts.authorId], references: [users.id] }),
}));
