import type * as schema from "@/drizzle/schema";

type DbNode = typeof schema.nodes.$inferSelect;
type DbPort = typeof schema.ports.$inferSelect;
type DbEdge = typeof schema.edges.$inferSelect;
type Port = Pick<DbPort, "id" | "type" | "name">;
export type Node = Pick<DbNode, "id" | "position" | "type"> & {
	inputPorts: Port[];
	outputPorts: Port[];
};
export type Edge = Pick<DbEdge, "id" | "edgeType"> & {
	inputPort: Pick<DbPort, "id" | "nodeId">;
	outputPort: Pick<DbPort, "id" | "nodeId">;
};
export type Blueprint = {
	agent: {
		id: number;
		urlId: string;
	};
	id: number;
	nodes: Node[];
	edges: Edge[];
};

type AssertNode = (input: unknown) => asserts input is Node;
/**
 * @todo Implement this function
 */
export const assertNode: AssertNode = (input) => {};
