import type { Parameter, ParameterBlueprint } from "./parameter/types";

export type GiselleNodeId = `nd_${string}`;

export const giselleNodeCategories = {
	instruction: "instruction",
	action: "action",
} as const;
export type GiselleNodeCategory =
	(typeof giselleNodeCategories)[keyof typeof giselleNodeCategories];

export type GiselleNodeBlueprint = {
	object: "nodeBlueprint";
	category: GiselleNodeCategory;
	archetype: string;
	parameters?: ParameterBlueprint;
	resultPortLabel: string;
};

export type XYPosition = {
	x: number;
	y: number;
};

export type GiselleNodeObject = {
	id: GiselleNodeId;
	object: "node";
	category: GiselleNodeCategory;
	archetype: string;
	parameters?: Parameter;
	ui: {
		position: XYPosition;
		selected?: boolean;
	};
	resultPortLabel: string;
};

export type InferGiselleNodeObject<T extends GiselleNodeBlueprint> = {
	id: GiselleNodeId;
	object: "node";
	archetype: T["archetype"];
	category: T["category"];
	parameters?: T["parameters"] extends ParameterBlueprint
		? Parameter
		: undefined;
	ui: {
		position: XYPosition;
	};
	resultPortLabel: T["resultPortLabel"];
};
