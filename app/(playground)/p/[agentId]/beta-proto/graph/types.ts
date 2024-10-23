import type { Artifact } from "../artifact/types";
import type { ConnectorObject } from "../connector/types";
import type { GiselleNode } from "../giselle-node/types";
import type { WebSearch } from "../web-search/types";

export const playgroundModes = {
	edit: "edit",
	view: "view",
} as const;
type PlaygroundMode = (typeof playgroundModes)[keyof typeof playgroundModes];
export type Graph = {
	nodes: GiselleNode[];
	connectors: ConnectorObject[];
	artifacts: Artifact[];
	webSearches: WebSearch[];
	mode: PlaygroundMode;
};

export type GraphState = {
	graph: Graph;
};
