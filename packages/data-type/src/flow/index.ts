import { z } from "zod";
import { NodeId } from "../node";
import { WorkspaceId } from "../workspace";
import { FlowTriggerId, GitHubTrigger } from "./trigger";

export const FlowTrigger = z.object({
	id: FlowTriggerId.schema,
	workspaceId: WorkspaceId.schema,
	nodeId: NodeId.schema,
	enable: z.boolean().default(true),
	configuration: z.discriminatedUnion("provider", [GitHubTrigger]),
});
