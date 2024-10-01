import type { Artifact } from "../artifact/types";
import type { ConnectorObject } from "../connector/types";
import type { GiselleNode } from "../giselle-node/types";

export type Graph = {
	nodes: GiselleNode[];
	connectors: ConnectorObject[];
	artifacts: Artifact[];
};

export type GraphState = {
	graph: Graph;
};
