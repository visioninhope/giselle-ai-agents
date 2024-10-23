import type { Artifact } from "../artifact/types";
import type { ConnectorObject } from "../connector/types";
import type { Flow } from "../flow/types";
import type { GiselleNode } from "../giselle-node/types";
import type { WebSearch } from "../web-search/types";

export const playgroundModes = {
	edit: "edit",
	view: "view",
} as const;
export type PlaygroundMode =
	(typeof playgroundModes)[keyof typeof playgroundModes];
export type Graph = {
	nodes: GiselleNode[];
	connectors: ConnectorObject[];
	artifacts: Artifact[];
	webSearches: WebSearch[];
	mode: PlaygroundMode;
	flow?: Flow | null | undefined;
};

export type GraphState = {
	graph: Graph;
};
