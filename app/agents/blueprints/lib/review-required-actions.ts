import {
	type Blueprint,
	type BlueprintRequiredAction,
	endWithResponseNode,
	inferSteps,
	startWithOnRequestNode,
} from "@/app/agents/blueprints";
import { onRequest, response } from "@/app/nodes";

export const reviewRequiredActions = (blueprint: Blueprint) => {
	const requiredActions: BlueprintRequiredAction[] = [];
	const inferedSteps = inferSteps(blueprint);
	const firstStepNode =
		inferedSteps.length === 0
			? null
			: blueprint.nodes.find((node) => inferedSteps[0].nodeId === node.id);
	console.log({ firstStepNode, name: onRequest.name });
	if (firstStepNode?.className !== onRequest.name) {
		requiredActions.push(startWithOnRequestNode);
	}
	const lastStepNode =
		inferedSteps.length === 0
			? null
			: blueprint.nodes.find(
					(node) => inferedSteps[inferedSteps.length - 1].nodeId === node.id,
				);
	if (lastStepNode?.className !== response.name) {
		requiredActions.push(endWithResponseNode);
	}
	return requiredActions;
};
