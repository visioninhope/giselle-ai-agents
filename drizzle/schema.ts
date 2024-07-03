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

export const workspaces = pgTable(
	"workspaces",
	{
		id: serial("id").primaryKey(),
		slug: text("slug").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(workspaces) => {
		return {
			uniqueIdx: uniqueIndex("unique_idx").on(workspaces.slug),
		};
	},
);
export const workspacesRelations = relations(workspaces, ({ many }) => ({
	nodes: many(nodes),
	edges: many(edges),
}));

export const nodes = pgTable("nodes", {
	id: serial("id").primaryKey(),
	type: text("type").notNull(),
	workspaceId: integer("workspace_id")
		.notNull()
		.references(() => workspaces.id),
	position: jsonb("position").$type<{ x: number; y: number }>().notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const nodesRelations = relations(nodes, ({ one }) => ({
	workspace: one(workspaces, {
		fields: [nodes.workspaceId],
		references: [workspaces.id],
	}),
}));

export const edges = pgTable("edges", {
	id: serial("id").primaryKey(),
	workspaceId: integer("workspace_id")
		.notNull()
		.references(() => workspaces.id),
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
// export const edgesRelations = relations(edges, ({ one }) => ({
// 	workflow: one(workspaces, {
// 		fields: [edges.workflowId],
// 		references: [workspaces.id],
// 	}),
// }));

export const workflows = pgTable("workflows", {
	id: serial("id").primaryKey(),
	workspaceId: integer("workspace_id")
		.notNull()
		.references(() => workspaces.id),
});

export const steps = pgTable("steps", {
	id: serial("id").primaryKey(),
	workflowId: integer("workflow_id")
		.notNull()
		.references(() => workflows.id),
	nodeId: integer("node_id")
		.notNull()
		.references(() => nodes.id),
	order: integer("order").notNull(),
});

export type RunStatus = "creating" | "running" | "success" | "failed";
export const runs = pgTable("runs", {
	id: serial("id").primaryKey(),
	workflowId: integer("workflow_id")
		.notNull()
		.references(() => workflows.id),
	runningNodeId: integer("running_node_id").references(() => nodes.id),
	status: text("status").$type<RunStatus>().notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

type RunStepStatus = "idle" | "running" | "success" | "failed";
export const runSteps = pgTable("run_steps", {
	id: serial("id").primaryKey(),
	runId: integer("run_id")
		.notNull()
		.references(() => runs.id),
	stepId: integer("step_id")
		.notNull()
		.references(() => steps.id),
	status: text("status").$type<RunStepStatus>().notNull(),
	startedAt: timestamp("started_at"),
	finishedAt: timestamp("finished_at"),
});
