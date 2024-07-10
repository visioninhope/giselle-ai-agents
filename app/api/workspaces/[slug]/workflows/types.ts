import type { nodes, runSteps, steps } from "@/drizzle/schema";

export type StepWithNode = typeof steps.$inferSelect & {
	node: Pick<typeof nodes.$inferSelect, "type" | "id">;
};

export type StepWithNodeAndRunStep = StepWithNode & {
	runStep: typeof runSteps.$inferSelect;
};
