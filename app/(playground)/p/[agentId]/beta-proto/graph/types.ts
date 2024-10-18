import type { Artifact } from "../artifact/types";
import type { ConnectorObject } from "../connector/types";
import type { GiselleNode } from "../giselle-node/types";
import type { WebSearch } from "../web-search/types";

export type Graph = {
	nodes: GiselleNode[];
	connectors: ConnectorObject[];
	artifacts: Artifact[];
	webSearches: WebSearch[];
};

export type GraphState = {
	graph: Graph;
};
