import type { nodes, processes, runProcesses } from "@/drizzle/schema";

export type NodeSelectedColumnsForStep = Pick<
	typeof nodes.$inferSelect,
	"type" | "id"
>;
export type StepWithNode = typeof processes.$inferSelect & {
	node: NodeSelectedColumnsForStep;
};

export type StepWithNodeAndRunStep = StepWithNode & {
	runStep: typeof runProcesses.$inferSelect;
};
