import type * as schema from "@/drizzle/schema";
import type {
	KnowledgeContentType,
	NodeData,
	NodePosition,
} from "@/drizzle/schema";
import type { BlueprintRequiredAction } from "./required-action";

type DbNode = typeof schema.nodes.$inferSelect;
type DbPort = Omit<typeof schema.ports.$inferSelect, "nodeClassKey">;
type DbEdge = typeof schema.edges.$inferSelect;
export type BlueprintPort = DbPort & {
	isCreating?: boolean;
};
export type Node = {
	id: number;
	isCreating?: boolean;
	className: string;
	inputPorts: BlueprintPort[];
	outputPorts: BlueprintPort[];
	data?: NodeData | null;
	position: NodePosition;
};
export type Edge = Pick<DbEdge, "edgeType"> & {
	id: number;
	isCreating?: boolean;
	inputPort: { id: number; nodeId: number };
	outputPort: { id: number; nodeId: number };
};
export type KnowledgeContent = {
	isCreating?: boolean;
	id: number;
	name: string;
	type: KnowledgeContentType;
	file: {
		id: number;
	};
};
export type Knowledge = {
	isCreating?: boolean;
	id: number;
	name: string;
	contents: KnowledgeContent[];
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
	knowledges: Knowledge[];
	version: number;
	dirty: boolean;
	builded: boolean;
	requiredActions?: BlueprintRequiredAction[];
	requestInterface?: RequestInterface | null | undefined;
};
