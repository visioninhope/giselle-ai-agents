import { WorkspaceId } from "@giselle-sdk/data-type";
import { createIdGenerator } from "@giselle-sdk/utils";
import { z } from "zod/v4";

export const FlowRunId = createIdGenerator("flrn");
export type FlowRunId = z.infer<typeof FlowRunId.schema>;

export const FlowRunObject = z.object({
	id: FlowRunId.schema,
	workspaceId: WorkspaceId.schema,
	status: z.enum(["inProgress", "completed", "failed", "cancelled"]),
	steps: z.object({
		queued: z.number(),
		inProgress: z.number(),
		completed: z.number(),
		cancelled: z.number(),
		failed: z.number(),
	}),
	trigger: z.string(),
	duration: z.object({
		wallClock: z.number(),
		totalTask: z.number(),
	}),
	usage: z.object({
		promptTokens: z.number(),
		completionTokens: z.number(),
		totalTokens: z.number(),
	}),
	createdAt: z.number(),
	updatedAt: z.number(),
});
export type FlowRunObject = z.infer<typeof FlowRunObject>;

export const FlowRunIndexObject = FlowRunObject.pick({
	id: true,
	workspaceId: true,
});
