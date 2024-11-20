type NodeId = `nd_${string}`;
interface NodeBase {
	id: NodeId;
	type: string;
	position: Position;
}

interface Position {
	x: number;
	y: number;
}

interface Action extends NodeBase {
	type: "action";
	content: ActionContent;
}
interface ActionContentBase {
	type: string;
}
interface TextGeneration extends ActionContentBase {
	type: "textGeneration";
	llm: string;
	temperature: number;
	topP: number;
	instruction: string;
	requirement: NodeHandle;
	sources: NodeHandle[];
}
interface WebSearch extends ActionContentBase {
	type: "webSearch";
}
type ActionContent = TextGeneration | WebSearch;

interface Variable extends NodeBase {
	type: "variable";
	variableContent: VariableContent;
}

interface VariableContentBase {
	type: string;
}

interface Text extends VariableContentBase {
	type: "text";
}
interface File extends VariableContentBase {
	type: "file";
}

type VariableContent = Text | File;

type NodeHandleId = `ndr_${string}`;
interface NodeHandle {
	id: NodeHandleId;
	label: string;
}

export type Node = Action | Variable;

export interface Connection {
	sourceNodeId: NodeId;
	sourceNodeHandleId: NodeHandleId;
	targetNodeId: NodeId;
	targetNodeHandleId: NodeHandleId;
}

export interface Graph {
	nodes: Node[];
	connections: Connection[];
}
