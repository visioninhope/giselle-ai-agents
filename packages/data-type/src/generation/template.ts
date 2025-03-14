import { z } from "zod";
import { ActionNode, Node } from "../node";

export const GenerationTemplate = z.object({
	actionNode: ActionNode,
	sourceNodes: z.array(Node),
});
export type GenerationTemplate = z.infer<typeof GenerationTemplate>;
