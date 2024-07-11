import {
	integer,
	jsonb,
	pgTable,
	pgView,
	serial,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";

export const agents = pgTable(
	"agents",
	{
		id: serial("id").primaryKey(),
		name: text("name"),
		urlId: text("url_id").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(agents) => {
		return {
			uniqueIdx: uniqueIndex("unique_idx").on(agents.urlId),
		};
	},
);

export const blueprints = pgTable("blueprints", {
	id: serial("id").primaryKey(),
	agentId: integer("agent_id"),
	version: integer("version").notNull(),
});

export const nodes = pgTable("nodes", {
	id: serial("id").primaryKey(),
	blueprintId: integer("blueprint_id")
		.notNull()
		.references(() => blueprints.id),
	type: text("type").notNull(),
	position: jsonb("position").$type<{ x: number; y: number }>().notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

type PortDirection = "input" | "output";
export type PortType = "data" | "execution";
export const ports = pgTable("ports", {
	id: serial("id").primaryKey(),
	nodeId: integer("node_id")
		.notNull()
		.references(() => nodes.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	direction: text("direction").$type<PortDirection>().notNull(),
	type: text("type").$type<PortType>().notNull(),
	order: integer("order").notNull(),
});

type EdgeType = "data" | "execution";
export const edges = pgTable("edges", {
	id: serial("id").primaryKey(),
	blueprintId: integer("blueprint_id")
		.notNull()
		.references(() => blueprints.id),
	inputPortId: integer("input_port_id")
		.notNull()
		.references(() => ports.id),
	outputPortId: integer("output_port_id")
		.notNull()
		.references(() => ports.id),
	edgeType: text("edge_type").$type<EdgeType>().notNull(),
});

export const processes = pgTable("processes", {
	id: serial("id").primaryKey(),
	blueprintId: integer("blueprint_id")
		.notNull()
		.references(() => blueprints.id),
	nodeId: integer("node_id")
		.notNull()
		.references(() => nodes.id),
	order: integer("order").notNull(),
});

export const dataKnots = pgTable("data_knots", {
	id: serial("id").primaryKey(),
	processId: integer("process_id").references(() => processes.id),
	portId: integer("port_id")
		.notNull()
		.references(() => ports.id),
});

export const dataRoutes = pgTable("data_routes", {
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
	blueprintId: integer("blueprint_id")
		.notNull()
		.references(() => blueprints.id),
	status: text("status").$type<RunStatus>().notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	startedAt: timestamp("started_at"),
	finishedAt: timestamp("finished_at"),
});

export type RunProcessStatus = "idle" | "running" | "success" | "failed";
export const runProcesses = pgTable("run_processes", {
	id: serial("id").primaryKey(),
	runId: integer("run_id")
		.notNull()
		.references(() => runs.id),
	processId: integer("process_id")
		.notNull()
		.references(() => processes.id),
	status: text("status").$type<RunProcessStatus>().notNull(),
	startedAt: timestamp("started_at"),
	finishedAt: timestamp("finished_at"),
});

export const runDataKnotMessages = pgTable("run_data_knot_messages", {
	id: serial("id").primaryKey(),
	runId: integer("run_id")
		.notNull()
		.references(() => runs.id),
	dataKnotId: integer("data_knot_id")
		.notNull()
		.references(() => dataKnots.id),
	message: jsonb("message").notNull(),
});

export const runTriggerRelations = pgTable("run_trigger_relations", {
	id: serial("id").primaryKey(),
	runId: integer("run_id")
		.notNull()
		.references(() => runs.id),
	triggerId: text("trigger_id").notNull(),
});

export const stepDataKnots = pgView("step_data_knots", {
	stepId: integer("step_id").notNull(),
	nodeId: integer("node_id").notNull(),
	portId: integer("port_id").notNull(),
	portName: text("port_name").notNull(),
	portDirection: text("port_direction").notNull(),
	dataKnotId: integer("data_knot_id").notNull(),
}).existing();

// Create `stepDataKnots` view
//
// CREATE OR REPLACE VIEW
//   "step_data_knots" AS
// SELECT
//   steps.id AS step_id,
//   steps.node_id AS node_id,
//   ports.id AS port_id,
//   ports.name AS port_name,
//   ports.direction as port_direction,
//   data_knots.id AS data_knot_id
// FROM
//   steps
//   INNER JOIN nodes ON nodes.id = steps.node_id
//   INNER JOIN ports ON ports.node_id = nodes.id
//   INNER JOIN data_knots ON data_knots.port_id = ports.id
//   AND data_knots.step_id = steps.id

export const stepStrands = pgView("step_strands", {
	stepId: integer("step_id").notNull(),
	nodeId: integer("node_id").notNull(),
	portName: text("port_name").notNull(),
	runId: integer("run_id").notNull(),
	message: jsonb("message").notNull(),
}).existing();

// Create `stepStrands` view
//
// CREATE OR REPLACE VIEW
//   "step_strands" AS
// SELECT
//   steps.id AS step_id,
//   steps.node_id AS node_id,
//   ports.name AS port_name,
//   run_data_knot_messages.run_id AS run_id,
//   run_data_knot_messages.message AS message
// FROM
//   steps
//   INNER JOIN nodes ON nodes.id = steps.node_id
//   INNER JOIN ports ON ports.node_id = nodes.id
//   INNER JOIN data_knots ON data_knots.port_id = ports.id
//   AND data_knots.step_id = steps.id
//   INNER JOIN data_routes ON data_routes.destination_knot_id = data_knots.id
//   INNER JOIN data_knots origin_data_knots ON origin_data_knots.id = data_routes.origin_knot_id
//   INNER JOIN run_data_knot_messages ON run_data_knot_messages.data_knot_id = origin_data_knots.id
