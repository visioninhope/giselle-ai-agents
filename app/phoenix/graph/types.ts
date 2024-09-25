import type { GiselleNodeObject } from "../giselle-node/types";

type Graph = {
	nodes: GiselleNodeObject[];
};

export type GraphState = {
	graph: Graph;
};
