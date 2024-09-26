import type { ConnectorObject } from "../connector/types";
import type {
	GiselleNode,
	GiselleNodeCategory,
	GiselleNodeId,
} from "../giselle-node/types";

export type Graph = {
	nodes: GiselleNode[];
	connectors: ConnectorObject[];
};

export type GraphState = {
	graph: Graph;
};
