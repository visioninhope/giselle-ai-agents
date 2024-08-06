import {
	boolean,
	integer,
	jsonb,
	pgTable,
	serial,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";

export const organizations = pgTable("organizations", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const teams = pgTable("teams", {
	id: serial("id").primaryKey(),
	organizationId: integer("organization_id")
		.notNull()
		.references(() => organizations.id),
	name: text("name").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
	id: serial("id").primaryKey(),
});
export const userInitialTasks = pgTable("user_initial_tasks", {
	id: serial("id").primaryKey(),
	userId: integer("user_id")
		.notNull()
		.references(() => users.id),
	taskId: text("task_id").notNull(),
});

export const supabaseUserMappings = pgTable("supabase_user_mappings", {
	userId: integer("user_id")
		.notNull()
		.references(() => users.id),
	supabaseUserId: text("supabase_user_id").notNull(),
});

type TeamRole = "admin" | "member";
export const teamMemberships = pgTable("team_memberships", {
	id: serial("id").primaryKey(),
	userId: integer("user_id")
		.notNull()
		.references(() => users.id),
	teamId: integer("team_id")
		.notNull()
		.references(() => teams.id),
	role: text("role").notNull().$type<TeamRole>(),
});

export const agents = pgTable(
	"agents",
	{
		id: serial("id").primaryKey(),
		name: text("name"),
		urlId: text("url_id").notNull(),
		teamId: integer("team_id")
			.notNull()
			.references(() => teams.id),
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
	agentId: integer("agent_id")
		.notNull()
		.references(() => agents.id),
	version: integer("version").notNull(),
	dirty: boolean("dirty").notNull().default(false),
	builded: boolean("builded").notNull().default(false),
});

type NodePosition = { x: number; y: number };
export const nodes = pgTable("nodes", {
	id: serial("id").primaryKey(),
	agentId: integer("agent_id")
		.notNull()
		.references(() => agents.id, { onDelete: "cascade" }),
	className: text("class_name").notNull(),
	position: jsonb("position").$type<NodePosition>().notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type NodeProperty = {
	name: string;
	label?: string;
	value?: string;
};
export type NodeProperties = NodeProperty[];
export const nodesBlueprints = pgTable("nodes_blueprints", {
	id: serial("id").primaryKey(),
	blueprintId: integer("blueprint_id")
		.notNull()
		.references(() => blueprints.id, { onDelete: "cascade" }),
	nodeId: integer("node_id")
		.notNull()
		.references(() => nodes.id, { onDelete: "cascade" }),
	nodeProperties: jsonb("node_properties")
		.$type<NodeProperties>()
		.notNull()
		.default([]),
});

type PortDirection = "input" | "output";
export type PortType = "data" | "execution";
export const ports = pgTable("ports", {
	id: serial("id").primaryKey(),
	nodeId: integer("node_id")
		.notNull()
		.references(() => nodes.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	nodeClassKey: text("node_class_key"),
	direction: text("direction").$type<PortDirection>().notNull(),
	type: text("type").$type<PortType>().notNull(),
	order: integer("order").notNull(),
});

export const portsBlueprints = pgTable("ports_blueprints", {
	id: serial("id").primaryKey(),
	nodesBlueprintsId: integer("nodes_blueprints_id")
		.notNull()
		.references(() => nodesBlueprints.id, { onDelete: "cascade" }),
	portId: integer("port_id")
		.notNull()
		.references(() => ports.id, { onDelete: "cascade" }),
});

export type EdgeType = "data" | "execution";
export const edges = pgTable("edges", {
	id: serial("id").primaryKey(),
	agentId: integer("agent_id")
		.notNull()
		.references(() => agents.id, { onDelete: "cascade" }),
	inputPortId: integer("input_port_id")
		.notNull()
		.references(() => ports.id, { onDelete: "cascade" }),
	outputPortId: integer("output_port_id")
		.notNull()
		.references(() => ports.id, { onDelete: "cascade" }),
	edgeType: text("edge_type").$type<EdgeType>().notNull(),
});

export const edgesBlueprints = pgTable("edges_blueprints", {
	id: serial("id").primaryKey(),
	blueprintId: integer("blueprint_id")
		.notNull()
		.references(() => blueprints.id, { onDelete: "cascade" }),
	edgeId: integer("edge_id")
		.notNull()
		.references(() => edges.id, { onDelete: "cascade" }),
});

export const steps = pgTable("steps", {
	id: serial("id").primaryKey(),
	blueprintId: integer("blueprint_id")
		.notNull()
		.references(() => blueprints.id),
	nodeId: integer("node_id")
		.notNull()
		.references(() => nodes.id),
	order: integer("order").notNull(),
});

export type RequestStatus = "creating" | "running" | "success" | "failed";
export const requests = pgTable("requests", {
	id: serial("id").primaryKey(),
	blueprintId: integer("blueprint_id")
		.notNull()
		.references(() => blueprints.id),
	status: text("status").$type<RequestStatus>().notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	startedAt: timestamp("started_at"),
	finishedAt: timestamp("finished_at"),
});

export const requestResults = pgTable("request_results", {
	id: serial("id").primaryKey(),
	requestId: integer("request_id")
		.notNull()
		.references(() => requests.id),
	text: text("text").notNull(),
});

export type RequestStepStatus = "idle" | "running" | "success" | "failed";
export const requestSteps = pgTable("request_steps", {
	id: serial("id").primaryKey(),
	requestId: integer("run_id")
		.notNull()
		.references(() => requests.id),
	stepId: integer("step_id")
		.notNull()
		.references(() => steps.id),
	status: text("status").$type<RequestStepStatus>().notNull(),
	startedAt: timestamp("started_at"),
	finishedAt: timestamp("finished_at"),
});

export const requestPortMessages = pgTable("request_port_messages", {
	id: serial("id").primaryKey(),
	requestId: integer("request_id")
		.notNull()
		.references(() => requests.id),
	portsBlueprintsId: integer("ports_blueprints_id")
		.notNull()
		.references(() => portsBlueprints.id),
	message: jsonb("message").notNull(),
});

export const requestTriggerRelations = pgTable("request_trigger_relations", {
	id: serial("id").primaryKey(),
	requestId: integer("request_id")
		.notNull()
		.references(() => requests.id),
	triggerId: text("trigger_id").notNull(),
});

export const nodeRepresentedAgents = pgTable("node_represented_agents", {
	id: serial("id").primaryKey(),
	nodeId: integer("node_id")
		.notNull()
		.references(() => nodes.id, { onDelete: "cascade" }),
	representedAgentId: integer("represented_agent_id")
		.notNull()
		.references(() => agents.id, { onDelete: "cascade" }),
	representedBlueprintId: integer("represented_blueprint_id")
		.notNull()
		.references(() => blueprints.id, { onDelete: "cascade" }),
});

export const portRepresentedAgentPorts = pgTable(
	"port_represented_agent_ports",
	{
		id: serial("id").primaryKey(),
		portId: integer("port_id")
			.notNull()
			.references(() => ports.id, { onDelete: "cascade" }),
		representedAgentPortId: integer("represented_agent_port_id")
			.notNull()
			.references(() => ports.id, { onDelete: "cascade" }),
	},
);
