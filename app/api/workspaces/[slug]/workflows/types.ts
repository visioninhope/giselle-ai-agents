import type { nodes, runSteps, steps } from "@/drizzle/schema";
export type StepWithNodeAndRunStep = typeof steps.$inferSelect & {
	node: typeof nodes.$inferSelect;
	runStep: typeof runSteps.$inferSelect;
};
