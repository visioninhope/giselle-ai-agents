import { createIdGenerator } from "@giselle-sdk/utils";
import { z } from "zod/v4";
import { Connection } from "../connection";
import { NodeId, NodeLike, NodeUIState } from "../node";
import { Secret } from "../secret";

export const WorkspaceId = createIdGenerator("wrks");
export type WorkspaceId = z.infer<typeof WorkspaceId.schema>;

export const WorkspaceSchemaVersion = z.enum(["20250221"]);
export const Viewport = z.object({
	x: z.number(),
	y: z.number(),
	zoom: z.number(),
});
export type Viewport = z.infer<typeof Viewport>;
export const UIState = z.object({
	nodeState: z.record(NodeId.schema, NodeUIState),
	viewport: Viewport,
});
export type UIState = z.infer<typeof UIState>;

export const Workspace = z.object({
	id: WorkspaceId.schema,
	name: z.string().optional(),
	schemaVersion: WorkspaceSchemaVersion,
	nodes: z.array(NodeLike),
	connections: z.array(Connection),
	ui: UIState,
	secrets: z.array(Secret).optional().default([]),
});
export type Workspace = z.infer<typeof Workspace>;

export function generateInitialWorkspace() {
	const data = {
		id: WorkspaceId.generate(),
		schemaVersion: "20250221",
		nodes: [],
		connections: [],
		ui: {
			nodeState: {},
			viewport: {
				x: 0,
				y: 0,
				zoom: 1,
			},
		},
	} satisfies z.input<typeof Workspace>;
	return Workspace.parse(data);
}
