import { createIdGenerator } from "@giselle-sdk/utils";
import { z } from "zod/v4";
import { Connection } from "../connection";
import { Node, NodeLike, OperationNode } from "../node";

export const JobId = createIdGenerator("jb");
export type JobId = z.infer<typeof JobId.schema>;
export const WorkflowId = createIdGenerator("wf");
export type WorkflowId = z.infer<typeof WorkflowId.schema>;

export const Operation = z.object({
	node: OperationNode,
	sourceNodes: z.array(Node),
	connections: z.array(Connection),
});
export type Operation = z.infer<typeof Operation>;

export const Job = z.object({
	id: JobId.schema,
	workflowId: WorkflowId.schema,
	operations: z.array(Operation),
});
export type Job = z.infer<typeof Job>;

export const Workflow = z.object({
	id: WorkflowId.schema,
	jobs: z.array(Job),
	nodes: z.array(NodeLike),
});
export type Workflow = z.infer<typeof Workflow>;
