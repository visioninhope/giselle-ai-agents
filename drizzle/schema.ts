import {
	boolean,
	integer,
	jsonb,
	pgTable,
	serial,
	text,
	timestamp,
	unique,
} from "drizzle-orm/pg-core";

import type { VectorStore } from "openai/resources/beta/vector-stores/vector-stores";

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
export const teamMemberships = pgTable(
	"team_memberships",
	{
		id: serial("id").primaryKey(),
		userId: integer("user_id")
			.notNull()
			.references(() => users.id),
		teamId: integer("team_id")
			.notNull()
			.references(() => teams.id),
		role: text("role").notNull().$type<TeamRole>(),
	},
	(teamMembership) => ({
		teamMembershipsUserTeamUnique: unique().on(
			teamMembership.userId,
			teamMembership.teamId,
		),
	}),
);

export const agents = pgTable("agents", {
	id: serial("id").primaryKey(),
	name: text("name"),
	urlId: text("url_id").notNull().unique(),
	teamId: integer("team_id")
		.notNull()
		.references(() => teams.id),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const blueprints = pgTable(
	"blueprints",
	{
		id: serial("id").primaryKey(),
		agentId: integer("agent_id")
			.notNull()
			.references(() => agents.id),
		version: integer("version").notNull(),
		dirty: boolean("dirty").notNull().default(false),
		builded: boolean("builded").notNull().default(false),
	},
	(blueprint) => ({
		blueprintsAgentIdVersionUnique: unique().on(
			blueprint.agentId,
			blueprint.version,
		),
	}),
);

export type NodeData = Record<string, unknown>;
export type NodePosition = { x: number; y: number };
export const nodes = pgTable("nodes", {
	id: serial("id").primaryKey(),
	blueprintId: integer("blueprint_id")
		.notNull()
		.references(() => blueprints.id, { onDelete: "cascade" }),
	className: text("class_name").notNull(),
	data: jsonb("data").$type<NodeData>(),
	position: jsonb("position").$type<NodePosition>().notNull(),
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

export type EdgeType = "data" | "execution";
export const edges = pgTable(
	"edges",
	{
		id: serial("id").primaryKey(),
		blueprintId: integer("blueprint_id")
			.notNull()
			.references(() => blueprints.id, { onDelete: "cascade" }),
		inputPortId: integer("input_port_id")
			.notNull()
			.references(() => ports.id, { onDelete: "cascade" }),
		outputPortId: integer("output_port_id")
			.notNull()
			.references(() => ports.id, { onDelete: "cascade" }),
		edgeType: text("edge_type").$type<EdgeType>().notNull(),
	},
	(edge) => ({
		edgesInputPortIdOutputPortIdUnique: unique().on(
			edge.inputPortId,
			edge.outputPortId,
		),
	}),
);

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
		.references(() => requests.id)
		.unique(),
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

export const requestPortMessages = pgTable(
	"request_port_messages",
	{
		id: serial("id").primaryKey(),
		requestId: integer("request_id")
			.notNull()
			.references(() => requests.id),
		portId: integer("port_id")
			.notNull()
			.references(() => ports.id),
		message: jsonb("message").notNull(),
	},
	(requestPortMessage) => ({
		requestPortMessagesRequestIdPortIdUnique: unique().on(
			requestPortMessage.requestId,
			requestPortMessage.portId,
		),
	}),
);

export const requestTriggerRelations = pgTable("request_trigger_relations", {
	id: serial("id").primaryKey(),
	requestId: integer("request_id")
		.notNull()
		.references(() => requests.id),
	triggerId: text("trigger_id").notNull(),
});

export const oauthCredentials = pgTable(
	"oauth_credentials",
	{
		id: serial("id").primaryKey(),
		userId: integer("user_id")
			.notNull()
			.references(() => users.id),
		provider: text("provider").notNull(),
		providerAccountId: text("provider_account_id").notNull(),
		accessToken: text("access_token").notNull(),
		refreshToken: text("refresh_token"),
		expiresAt: timestamp("expires_at"),
		tokenType: text("token_type"),
		scope: text("scope"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => ({
		oauthCredentialsUserIdProviderProviderAccountIdUnique: unique().on(
			table.userId,
			table.provider,
			table.providerAccountId,
		),
	}),
);

export const knowledges = pgTable("knowledges", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	blueprintId: integer("blueprint_id")
		.notNull()
		.references(() => blueprints.id, { onDelete: "cascade" }),
});

type OpenaiVectorStoreStatus = VectorStore["status"];
export const knowledgeOpenaiVectorStoreRepresentations = pgTable(
	"knowledge_openai_vector_store_representations",
	{
		id: serial("id").primaryKey(),
		knowledgeId: integer("knowledge_id")
			.notNull()
			.references(() => knowledges.id, { onDelete: "cascade" }),
		openaiVectorStoreId: text("openai_vector_store_id").notNull().unique(),
		status: text("status").$type<OpenaiVectorStoreStatus>().notNull(),
	},
);
export const files = pgTable("files", {
	id: serial("id").primaryKey(),
	fileName: text("file_name").notNull(),
	fileType: text("file_type").notNull(),
	fileSize: integer("file_size").notNull(),
	blobUrl: text("blob_url").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const fileOpenaiFileRepresentations = pgTable(
	"file_openai_file_representations",
	{
		id: serial("id").primaryKey(),
		fileId: integer("file_id")
			.notNull()
			.references(() => files.id, { onDelete: "cascade" }),
		openaiFileId: text("openai_file_id").notNull().unique(),
	},
);

export const knowledgeAffiliations = pgTable(
	"knowledge_affiliations",
	{
		id: serial("id").primaryKey(),
		knowledgeId: integer("knowledge_id")
			.notNull()
			.references(() => knowledges.id, { onDelete: "cascade" }),
		fileId: integer("file_id")
			.notNull()
			.references(() => files.id, { onDelete: "cascade" }),
	},
	(knowledgeAffliations) => ({
		knowledgeAffliationsKnowledgeIdFileIdUnique: unique().on(
			knowledgeAffliations.fileId,
			knowledgeAffliations.knowledgeId,
		),
	}),
);

export const knowledgeAfflicationOpenaiVectorStoreFileRepresentations = pgTable(
	"knowledge_afflication_openai_vector_store_file_representations",
	{
		id: serial("id").primaryKey(),
		knowledgeAffiliationId: integer("knowledge_affiliation_id")
			.notNull()
			.references(() => knowledgeAffiliations.id, { onDelete: "cascade" }),
		openaiVectorStoreFileId: text("openai_vector_store_file_id")
			.notNull()
			.unique(),
	},
);
