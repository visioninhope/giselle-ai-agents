import type { nodes, runSteps, steps } from "@/drizzle/schema";

export type StepWithNode = typeof steps.$inferSelect & {
	node: typeof nodes.$inferSelect;
};

export type StepWithNodeAndRunStep = StepWithNode & {
	runStep: typeof runSteps.$inferSelect;
};
