import type { Blueprint, RequestInterfaceItem } from "../blueprint";
import { inferSteps } from "./infer-step";
import { reviewRequiredActions } from "./review-required-actions";

export const inferRequestInterface = (blueprint: Blueprint) => {
	const requiredActions = reviewRequiredActions(blueprint);
	if (requiredActions.length > 0) {
		return null;
	}
	return null;

	const inferedSteps = inferSteps(blueprint);
	const firstStepNode = blueprint.nodes.find(
		(node) => inferedSteps[0].nodeId === node.id,
	);
	const lastStepNode = blueprint.nodes.find(
		(node) => inferedSteps[inferedSteps.length - 1].nodeId === node.id,
	);
	const input: RequestInterfaceItem[] = (firstStepNode?.outputPorts ?? [])
		.filter(({ type }) => type === "data")
		.map(({ name, id }) => ({ name, portId: id }));
	const output: RequestInterfaceItem[] = [];
	return {
		input,
		output,
	};
};
