import type { GiselleNodeObject } from "../giselle-node/types";

export type Graph = {
	nodes: GiselleNodeObject[];
};

export type GraphState = {
	graph: Graph;
};
