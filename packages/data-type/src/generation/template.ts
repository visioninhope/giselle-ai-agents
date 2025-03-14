import { z } from "zod";
import { ActionNode, VariableNode } from "../node";

export const GenerationTemplate = z.object({
	actionNode: ActionNode,
	sourceNodes: z.array(VariableNode),
});
export type GenerationTemplate = z.infer<typeof GenerationTemplate>;
