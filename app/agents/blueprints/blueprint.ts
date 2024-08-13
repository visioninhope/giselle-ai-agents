import type * as schema from "@/drizzle/schema";
import type { NodeData, NodePosition } from "@/drizzle/schema";
import type { BlueprintRequiredAction } from "./required-action";

type DbNode = typeof schema.nodes.$inferSelect;
type DbPort = Omit<typeof schema.ports.$inferSelect, "nodeClassKey">;
type DbEdge = typeof schema.edges.$inferSelect;
type DbPortsBlueprints = typeof schema.portsBlueprints.$inferSelect;
export type BlueprintPort = DbPort & {
	isCreating?: boolean;
	portsBlueprintsId: DbPortsBlueprints["id"];
};
export type Node = {
	id: number;
	isCreating?: boolean;
	className: string;
	inputPorts: BlueprintPort[];
	outputPorts: BlueprintPort[];
	data?: NodeData;
	position: NodePosition;
};
export type Edge = Pick<DbEdge, "edgeType"> & {
	id: number;
	isCreating?: boolean;
	inputPort: { id: number; nodeId: number };
	outputPort: { id: number; nodeId: number };
};
export type RequestInterfaceItem = {
	portId: number;
	name: string;
};
type RequestInterface = {
	input: RequestInterfaceItem[];
	output: RequestInterfaceItem[];
};
export type Blueprint = {
	agent: {
		id: number;
		urlId: string;
	};
	id: number;
	nodes: Node[];
	edges: Edge[];
	version: number;
	dirty: boolean;
	builded: boolean;
	requiredActions?: BlueprintRequiredAction[];
	requestInterface?: RequestInterface | null | undefined;
};

type AssertNode = (input: unknown) => asserts input is Node;
/**
 * @todo Implement this function
 */
export const assertNode: AssertNode = (input) => {};
