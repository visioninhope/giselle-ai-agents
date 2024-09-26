import type { ConnectorObject } from "../connector/types";
import type {
	GiselleNodeCategory,
	GiselleNodeId,
	GiselleNodeObject,
} from "../giselle-node/types";

export type Graph = {
	nodes: GiselleNodeObject[];
	connectors: ConnectorObject[];
};

export type GraphState = {
	graph: Graph;
};
