import { WorkspaceId } from "@giselle-sdk/data-type";
import { createIdGenerator } from "@giselle-sdk/utils";
import { z } from "zod/v4";

export const ActId = createIdGenerator("flac");
export type ActId = z.infer<typeof ActId.schema>;

const ActAnnotationObject = z.object({
	level: z.enum(["info", "warning", "error"]),
	message: z.string(),
});

export const ActObject = z.object({
	id: ActId.schema,
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
	annotations: z.array(ActAnnotationObject).default([]),
});
export type ActObject = z.infer<typeof ActObject>;

export const ActIndexObject = ActObject.pick({
	id: true,
	workspaceId: true,
});
