import { WorkspaceId } from "@giselle-sdk/data-type";
import { createIdGenerator } from "@giselle-sdk/utils";
import { z } from "zod/v4";

export const FlowActId = createIdGenerator("flac");
export type FlowActId = z.infer<typeof FlowActId.schema>;

const FlowActAnnotationObject = z.object({
	level: z.enum(["info", "warning", "error"]),
	message: z.string(),
});

export const FlowActObject = z.object({
	id: FlowActId.schema,
	workspaceId: WorkspaceId.schema,
	status: z.enum(["inProgress", "completed", "failed", "cancelled"]),
	steps: z.object({
		queued: z.number(),
		inProgress: z.number(),
		completed: z.number(),
		warning: z.number(),
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
	annotations: z.array(FlowActAnnotationObject).default([]),
});
export type FlowActObject = z.infer<typeof FlowActObject>;

export const FlowActIndexObject = FlowActObject.pick({
	id: true,
	workspaceId: true,
});

// Backward compatibility aliases
export const FlowRunId = FlowActId;
export type FlowRunId = FlowActId;
export const FlowRunObject = FlowActObject;
export type FlowRunObject = FlowActObject;
export const FlowRunIndexObject = FlowActIndexObject;
