import { createIdGenerator } from "@giselle-sdk/utils";
import { z } from "zod";
import { Connection, Node, NodeId, NodeUIState } from "../node";
import { OpenAIVecrtorStore } from "../openai";
import { Workflow } from "../workflow";

export const WorkspaceId = createIdGenerator("wrks");
export type WorkspaceId = z.infer<typeof WorkspaceId.schema>;

export const WorkspaceProviderOptionOpenAI = z.object({
	vectorStore: OpenAIVecrtorStore,
});
export const WorkspaceProviderOptions = z.object({
	openai: z.optional(WorkspaceProviderOptionOpenAI),
});

export const Workspace = z.object({
	id: WorkspaceId.schema,
	nodes: z.array(Node),
	connections: z.array(Connection),
	ui: z.object({
		nodeState: z.record(NodeId.schema, NodeUIState),
	}),
	editingWorkflows: z.array(Workflow),
	providerOptions: z.optional(WorkspaceProviderOptions),
});
export type Workspace = z.infer<typeof Workspace>;

export function generateInitialWorkspace() {
	return {
		id: WorkspaceId.generate(),
		nodes: [],
		connections: [],
		ui: {
			nodeState: {},
		},
		editingWorkflows: [],
	} satisfies Workspace;
}
