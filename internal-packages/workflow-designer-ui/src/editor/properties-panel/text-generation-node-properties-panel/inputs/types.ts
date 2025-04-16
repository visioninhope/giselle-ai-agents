import type {
	Connection,
	Node,
	NodeBase,
	Output,
} from "@giselle-sdk/data-type";

export interface UnconnectedInput<T extends NodeBase = Node> {
	output: Output;
	node: T;
	connection?: never;
}
export interface ConnectedInput<T extends NodeBase = Node> {
	output: Output;
	node: T;
	connection: Connection;
}
export type Input<T extends NodeBase = Node> =
	| UnconnectedInput<T>
	| ConnectedInput<T>;
