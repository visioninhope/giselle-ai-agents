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
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(workflows) => {
		return {
			uniqueIdx: uniqueIndex("unique_idx").on(workflows.slug),
		};
	},
);
export const workflowsRelations = relations(workflows, ({ many }) => ({
	nodes: many(nodes),
	edges: many(edges),
}));

export const nodes = pgTable("nodes", {
	id: serial("id").primaryKey(),
	type: text("type").notNull(),
	workflowId: integer("workflow_id").references(() => workflows.id),
	position: jsonb("position").$type<{ x: number; y: number }>().notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const nodesRelations = relations(nodes, ({ one }) => ({
	workflow: one(workflows, {
		fields: [nodes.workflowId],
		references: [workflows.id],
	}),
}));

export const edges = pgTable("edges", {
	id: serial("id").primaryKey(),
	workflowId: integer("workflow_id").references(() => workflows.id),
	sourceNodeId: integer("source_node_id")
		.notNull()
		.references(() => nodes.id),
	sourceHandleId: text("source_handle_id"),
	targetNodeId: integer("target_node_id")
		.notNull()
		.references(() => nodes.id),
	targetHandleId: text("target_handle_id"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});
const edgesRelations = relations(edges, ({ one }) => ({
	workflow: one(workflows, {
		fields: [edges.workflowId],
		references: [workflows.id],
	}),
}));
