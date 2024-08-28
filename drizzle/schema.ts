import type { Node, Port, PortDirection, PortType } from "@/app/nodes";
import type { AgentId } from "@/services/agents";
import type {
	PlaygroundEdge,
	PlaygroundGraph,
} from "@/services/agents/playground/types";
import { relations } from "drizzle-orm";
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
	id: text("id").$type<AgentId>().notNull().unique(),
	dbId: serial("db_id").primaryKey(),
	name: text("name"),
	graph: jsonb("graph")
		.$type<PlaygroundGraph>()
		.notNull()
		.default({
			nodes: [],
			edges: [],
			viewport: {
				x: 0,
				y: 0,
				zoom: 1,
			},
		}),
	graphHash: text("graph_hash").notNull().unique(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const blueprints = pgTable("blueprints", {
	id: text("id").$type<`blpr_${string}`>().unique(),
	dbId: serial("db_id").primaryKey(),
	graph: jsonb("graph").$type<PlaygroundGraph>().notNull(),
	agentDbId: integer("agent_db_id")
		.notNull()
		.references(() => agents.dbId),
	beforeId: integer("before_id"),
	after: integer("after_id"),
});
export const blueprintRelations = relations(blueprints, ({ one }) => ({
	beforeBlueprint: one(blueprints, {
		fields: [blueprints.beforeId],
		references: [blueprints.id],
	}),
	afterBlueprint: one(blueprints, {
		fields: [blueprints.after],
		references: [blueprints.id],
	}),
}));

export const nodes = pgTable("nodes", {
	id: text("id").$type<Node["id"]>().notNull(),
	dbId: serial("db_id").primaryKey(),
	blueprintDbId: integer("blueprint_db_id")
		.notNull()
		.references(() => blueprints.dbId, { onDelete: "cascade" }),
	className: text("class_name").notNull(),
	data: jsonb("data").notNull(),
});

export const ports = pgTable("ports", {
	id: text("id").$type<Port["id"]>().notNull(),
	dbId: serial("db_id").primaryKey(),
	nodeDbId: integer("node_db_id")
		.notNull()
		.references(() => nodes.dbId, { onDelete: "cascade" }),
	name: text("name").notNull(),
	direction: text("direction").$type<PortDirection>().notNull(),
	type: text("type").$type<PortType>().notNull(),
});

export const edges = pgTable(
	"edges",
	{
		id: text("id").$type<PlaygroundEdge["id"]>().notNull().unique(),
		dbId: serial("db_id").primaryKey(),
		blueprintDbId: integer("blueprint_db_id")
			.notNull()
			.references(() => blueprints.dbId, { onDelete: "cascade" }),
		inputPortDbId: integer("input_port_db_id")
			.notNull()
			.references(() => ports.dbId, { onDelete: "cascade" }),
		outputPortDbId: integer("output_port_db_id")
			.notNull()
			.references(() => ports.dbId, { onDelete: "cascade" }),
	},
	(edge) => ({
		edgesInputPortIdOutputPortIdUnique: unique().on(
			edge.inputPortDbId,
			edge.outputPortDbId,
		),
	}),
);

export const steps = pgTable("steps", {
	dbId: serial("db_id").primaryKey(),
	blueprintDbId: integer("blueprint_db_id")
		.notNull()
		.references(() => blueprints.dbId),
	nodeDbId: integer("node_db_id")
		.notNull()
		.references(() => nodes.dbId),
	order: integer("order").notNull(),
});

export type RequestStatus = "creating" | "running" | "success" | "failed";
export const requests = pgTable("requests", {
	dbId: serial("db_id").primaryKey(),
	blueprintDbId: integer("blueprint_db_id")
		.notNull()
		.references(() => blueprints.dbId),
	status: text("status").$type<RequestStatus>().notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	startedAt: timestamp("started_at"),
	finishedAt: timestamp("finished_at"),
});

export const requestResults = pgTable("request_results", {
	dbId: serial("db_id").primaryKey(),
	requestDbId: integer("request_db_id")
		.notNull()
		.references(() => requests.dbId)
		.unique(),
	text: text("text").notNull(),
});

export type RequestStepStatus = "idle" | "running" | "success" | "failed";
export const requestSteps = pgTable("request_steps", {
	dbId: serial("db_id").primaryKey(),
	requestDbId: integer("request_db_id")
		.notNull()
		.references(() => requests.dbId),
	stepDbId: integer("step_db_id")
		.notNull()
		.references(() => steps.dbId),
	status: text("status").$type<RequestStepStatus>().notNull(),
	startedAt: timestamp("started_at"),
	finishedAt: timestamp("finished_at"),
});

export const requestPortMessages = pgTable(
	"request_port_messages",
	{
		dbId: serial("db_id").primaryKey(),
		requestDbId: integer("request_db_id")
			.notNull()
			.references(() => requests.dbId),
		portDbId: integer("port_db_id")
			.notNull()
			.references(() => ports.dbId),
		message: jsonb("message").notNull(),
	},
	(requestPortMessage) => ({
		requestPortMessagesRequestIdPortIdUnique: unique().on(
			requestPortMessage.requestDbId,
			requestPortMessage.portDbId,
		),
	}),
);

export const requestTriggerRelations = pgTable("request_trigger_relations", {
	dbId: serial("db_id").primaryKey(),
	requestDbId: integer("request_db_id")
		.notNull()
		.references(() => requests.dbId),
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

// export const knowledges = pgTable("knowledges", {
// 	id: serial("id").primaryKey(),
// 	name: text("name").notNull(),
// 	blueprintId: integer("blueprint_id")
// 		.notNull()
// 		.references(() => blueprints.id, { onDelete: "cascade" }),
// });

// type OpenaiVectorStoreStatus = VectorStore["status"];
// export const knowledgeOpenaiVectorStoreRepresentations = pgTable(
// 	"knowledge_openai_vector_store_representations",
// 	{
// 		id: serial("id").primaryKey(),
// 		knowledgeId: integer("knowledge_id")
// 			.notNull()
// 			.references(() => knowledges.id, { onDelete: "cascade" }),
// 		openaiVectorStoreId: text("openai_vector_store_id").notNull().unique(),
// 		status: text("status").$type<OpenaiVectorStoreStatus>().notNull(),
// 	},
// );
// export const files = pgTable("files", {
// 	id: serial("id").primaryKey(),
// 	fileName: text("file_name").notNull(),
// 	fileType: text("file_type").notNull(),
// 	fileSize: integer("file_size").notNull(),
// 	blobUrl: text("blob_url").notNull(),
// 	createdAt: timestamp("created_at").defaultNow().notNull(),
// });
// export const fileOpenaiFileRepresentations = pgTable(
// 	"file_openai_file_representations",
// 	{
// 		id: serial("id").primaryKey(),
// 		fileId: integer("file_id")
// 			.notNull()
// 			.references(() => files.id, { onDelete: "cascade" }),
// 		openaiFileId: text("openai_file_id").notNull().unique(),
// 	},
// );

// export type KnowledgeContentType = "file" | "text";
// export const knowledgeContents = pgTable(
// 	"knowledge_contents",
// 	{
// 		id: serial("id").primaryKey(),
// 		name: text("name").notNull(),
// 		type: text("knowledge_content_type")
// 			.$type<KnowledgeContentType>()
// 			.notNull(),
// 		knowledgeId: integer("knowledge_id")
// 			.notNull()
// 			.references(() => knowledges.id, { onDelete: "cascade" }),
// 		fileId: integer("file_id")
// 			.notNull()
// 			.references(() => files.id, { onDelete: "cascade" }),
// 	},
// 	(knowledgeContents) => ({
// 		knowledgeContentsKnowledgeIdFileIdUnique: unique().on(
// 			knowledgeContents.fileId,
// 			knowledgeContents.knowledgeId,
// 		),
// 	}),
// );

// export const knowledgeContentOpenaiVectorStoreFileRepresentations = pgTable(
// 	"knowledge_content_openai_vector_store_file_representations",
// 	{
// 		id: serial("id").primaryKey(),
// 		knowledgeContentId: integer("knowledge_content_id")
// 			.notNull()
// 			.references(() => knowledgeContents.id, { onDelete: "cascade" }),
// 		openaiVectorStoreFileId: text("openai_vector_store_file_id").notNull(),
// 	},
// );
