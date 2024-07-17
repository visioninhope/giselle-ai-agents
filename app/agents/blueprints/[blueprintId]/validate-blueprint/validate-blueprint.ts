import { type Blueprint, inferSteps } from "@/app/agents/blueprints";
import type { BlueprintValidationError } from "./errors";

export const validateBlueprint = (blueprint: Blueprint) => {
	const errors: BlueprintValidationError = [];
	const inferedSteps = inferSteps(blueprint);
	const firstStepNode = blueprint.nodes.find(
		(node) => inferedSteps[0].nodeId === node.id,
	);
	const lastStepNode = blueprint.nodes.find(
		(node) => inferedSteps[inferedSteps.length - 1].nodeId === node.id,
	);
};
