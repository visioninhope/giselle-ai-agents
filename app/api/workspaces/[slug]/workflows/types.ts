import type { nodes, runSteps, steps } from "@/drizzle/schema";

export type NodeSelectedColumnsForStep = Pick<
	typeof nodes.$inferSelect,
	"type" | "id"
>;
export type StepWithNode = typeof steps.$inferSelect & {
	node: NodeSelectedColumnsForStep;
};

export type StepWithNodeAndRunStep = StepWithNode & {
	runStep: typeof runSteps.$inferSelect;
};
