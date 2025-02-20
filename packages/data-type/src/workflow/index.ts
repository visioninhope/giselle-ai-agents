import { createIdGenerator } from "@giselle-sdk/utils";
import { z } from "zod";
import { GenerationTemplate } from "../generation/template";
import { Node } from "../node";

export const JobId = createIdGenerator("jb");
export type JobId = z.infer<typeof JobId.schema>;
export const WorkflowId = createIdGenerator("wf");
export type WorkflowId = z.infer<typeof WorkflowId.schema>;

export const Action = z.object({
	node: Node,
	generationTemplate: GenerationTemplate,
});
export type Action = z.infer<typeof Action>;

export const Job = z.object({
	id: JobId.schema,
	workflowId: WorkflowId.schema,
	actions: z.array(Action),
});
export type Job = z.infer<typeof Job>;

export const Workflow = z.object({
	id: WorkflowId.schema,
	jobs: z.array(Job),
	nodes: z.array(Node),
});
export type Workflow = z.infer<typeof Workflow>;
