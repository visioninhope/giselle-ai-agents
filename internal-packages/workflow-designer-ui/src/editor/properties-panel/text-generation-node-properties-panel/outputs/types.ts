import type {
	Connection,
	Node,
	NodeBase,
	Output,
} from "@giselle-sdk/data-type";

export type UnconnectedOutputWithDetails<T extends NodeBase = Node> = Output & {
	node: T;
	connection?: never;
};
export type ConnectedOutputWithDetails<T extends NodeBase = Node> = Output & {
	node: T;
	connection: Connection;
};
export type OutputWithDetails<T extends NodeBase = Node> =
	| UnconnectedOutputWithDetails<T>
	| ConnectedOutputWithDetails<T>;
