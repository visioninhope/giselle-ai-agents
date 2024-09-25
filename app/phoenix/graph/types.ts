import type { Connector } from "../connector/types";
import type {
	GiselleNodeCategory,
	GiselleNodeId,
	GiselleNodeObject,
} from "../giselle-node/types";

export type Graph = {
	nodes: GiselleNodeObject[];
	connectors: Connector[];
};

export type GraphState = {
	graph: Graph;
};
