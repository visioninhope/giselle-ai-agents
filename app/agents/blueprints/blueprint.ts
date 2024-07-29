import type { NodeClassName } from "@/app/node-classes";
import type * as schema from "@/drizzle/schema";
import type { NodeProperties } from "@/drizzle/schema";
import type { BlueprintRequiredAction } from "./required-action";

type DbNode = typeof schema.nodes.$inferSelect;
type DbPort = typeof schema.ports.$inferSelect;
type DbEdge = typeof schema.edges.$inferSelect;
type DbPortsBlueprints = typeof schema.portsBlueprints.$inferSelect;
export type BlueprintPort = Pick<
	DbPort,
	"type" | "name" | "direction" | "order" | "nodeClassKey"
> & {
	id: number;
	nodeId: number;
	portsBlueprintsId: DbPortsBlueprints["id"];
};
export type Node = Pick<DbNode, "position"> & {
	id: number;
	isCreating?: boolean;
	className: NodeClassName;
	inputPorts: BlueprintPort[];
	outputPorts: BlueprintPort[];
	properties: NodeProperties;
	propertyPortMap: Record<string, string>;
};
export type Edge = Pick<DbEdge, "edgeType"> & {
	id: number;
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
