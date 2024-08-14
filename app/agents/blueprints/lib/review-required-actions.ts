import {
	type Blueprint,
	type BlueprintRequiredAction,
	endWithResponseNode,
	inferSteps,
	startWithOnRequestNode,
} from "@/app/agents/blueprints";
import { NodeClassCategory, nodeClassHasCategory } from "@/app/nodes";

export const reviewRequiredActions = (blueprint: Blueprint) => {
	const requiredActions: BlueprintRequiredAction[] = [];
	const inferedSteps = inferSteps(blueprint);
	if (inferedSteps.length < 1) {
		requiredActions.push(startWithOnRequestNode);
	}
	const lastStepNode =
		inferedSteps.length < 2
			? null
			: blueprint.nodes.find(
					(node) => inferedSteps[inferedSteps.length - 1].nodeId === node.id,
				);
	if (
		lastStepNode == null ||
		!nodeClassHasCategory(lastStepNode.className, NodeClassCategory.Response)
	) {
		requiredActions.push(endWithResponseNode);
	}
	return requiredActions;
};
