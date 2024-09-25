import type { Parameter, ParameterBlueprint } from "./parameter/types";

export type GiselleNodeId = `nd_${string}`;

export type GiselleNodeBlueprint = {
	object: "nodeBlueprint";
	archetype: string;
	parameters?: ParameterBlueprint;
};

export type XYPosition = {
	x: number;
	y: number;
};

export type GiselleNodeObject = {
	id: GiselleNodeId;
	object: "node";
	archetype: string;
	parameters?: Parameter;
	ui: {
		position: XYPosition;
	};
};

export type InferGiselleNodeObject<T extends GiselleNodeBlueprint> = {
	id: GiselleNodeId;
	object: "node";
	archetype: T["archetype"];
	parameters?: T["parameters"] extends ParameterBlueprint
		? Parameter
		: undefined;
	ui: {
		position: XYPosition;
	};
};
