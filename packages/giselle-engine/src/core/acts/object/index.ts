import { WorkspaceId } from "@giselle-sdk/data-type";
import { createIdGenerator } from "@giselle-sdk/utils";
import { z } from "zod/v4";
import { GenerationId } from "../../generations/object";

export const ActId = createIdGenerator("act");
export type ActId = z.infer<typeof ActId.schema>;

const ActAnnotationObject = z.object({
	level: z.enum(["info", "warning", "error"]),
	message: z.string(),
});

const StepStatus = z.enum(["success", "in-progress", "failed", "pending"]);
export const StepId = createIdGenerator("stp");
const Step = z.object({
	id: StepId.schema,
	status: StepStatus,
	generationId: GenerationId.schema,
});

const SequenceStatus = z.enum(["success", "in-progress", "failed", "pending"]);
const SequenceId = createIdGenerator("sqn");
const Sequence = z.object({
	id: SequenceId.schema,
	generationId: GenerationId.schema,
	steps: z.array(Step),
	status: SequenceStatus,
});

export const Act = z.object({
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
	sequences: z.array(Sequence),
});
export type Act = z.infer<typeof Act>;

export const ActIndexObject = Act.pick({
	id: true,
	workspaceId: true,
});
