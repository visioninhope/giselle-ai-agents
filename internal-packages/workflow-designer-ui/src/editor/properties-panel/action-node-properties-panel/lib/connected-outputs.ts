import type { Input, Node, Output } from "@giselle-sdk/data-type";

export type InputWithConnectedOutput = Input & {
	connectedOutput?: Output & { node: Node };
};
