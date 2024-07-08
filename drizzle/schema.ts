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

export const nodes = pgTable("nodes", {
	id: serial("id").primaryKey(),
	workspaceId: integer("workspace_id")
		.notNull()
		.references(() => workspaces.id),
	type: text("type").notNull(),
	position: jsonb("position").$type<{ x: number; y: number }>().notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

type PortDirection = "input" | "output";
type PortType = "data" | "execution";
export const ports = pgTable("ports", {
	id: serial("id").primaryKey(),
	nodeId: integer("node_id")
		.notNull()
		.references(() => nodes.id),
	name: text("name").notNull(),
	direction: text("direction").$type<PortDirection>().notNull(),
	type: text("type").$type<PortType>().notNull(),
	order: integer("order").notNull(),
});

type EdgeType = "data" | "execution";
export const edges = pgTable("edges", {
	id: serial("id").primaryKey(),
	workspaceId: integer("workspace_id")
		.notNull()
		.references(() => workspaces.id),
	inputPortId: integer("input_port_id")
		.notNull()
		.references(() => ports.id),
	outputPortId: integer("output_port_id")
		.notNull()
		.references(() => ports.id),
	edgeType: text("edge_type").$type<EdgeType>().notNull(),
});

export const workflows = pgTable("workflows", {
	id: serial("id").primaryKey(),
	workspaceId: integer("workspace_id")
		.notNull()
		.references(() => workspaces.id),
	createdAt: timestamp("created_at").defaultNow().notNull(),
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

export const contexts = pgTable("contexts", {
	id: serial("id").primaryKey(),
	workflowId: integer("workflow_id")
		.notNull()
		.references(() => workflows.id),
	nodeId: integer("node_id")
		.notNull()
		.references(() => nodes.id),
});

export const dataKnots = pgTable("dataKnots", {
	id: serial("id").primaryKey(),
	stepId: integer("step_id").references(() => steps.id),
	contextId: integer("context_id").references(() => steps.id),
	portId: integer("port_id")
		.notNull()
		.references(() => ports.id),
});

export const dataRoutes = pgTable("dataRoutes", {
	id: serial("id").primaryKey(),
	originKnotId: integer("origin_knot_id")
		.notNull()
		.references(() => dataKnots.id),
	destinationKnotId: integer("destination_knot_id")
		.notNull()
		.references(() => dataKnots.id),
});

export type RunStatus = "creating" | "running" | "success" | "failed";
export const runs = pgTable("runs", {
	id: serial("id").primaryKey(),
	workflowId: integer("workflow_id")
		.notNull()
		.references(() => workflows.id),
	status: text("status").$type<RunStatus>().notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	startedAt: timestamp("started_at"),
	finishedAt: timestamp("finished_at"),
});

export type RunStepStatus = "idle" | "running" | "success" | "failed";
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

export const runTriggerRelations = pgTable("run_trigger_relations", {
	id: serial("id").primaryKey(),
	runId: integer("run_id")
		.notNull()
		.references(() => runs.id),
	triggerId: text("trigger_id").notNull(),
});
