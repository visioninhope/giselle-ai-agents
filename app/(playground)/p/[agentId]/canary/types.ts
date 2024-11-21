type NodeId = `nd_${string}`;
interface NodeBase {
	id: NodeId;
	name: string;
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
interface TextGenerateActionContent extends ActionContentBase {
	type: "textGeneration";
	llm: string;
	temperature: number;
	topP: number;
	instruction: string;
	requirement: NodeHandle;
	sources: NodeHandle[];
}
export interface TextGeneration extends Action {
	content: TextGenerateActionContent;
}
interface WebSearchActionContent extends ActionContentBase {
	type: "webSearch";
}
export interface WebSearchAction extends Action {
	content: WebSearchActionContent;
}
type ActionContent = TextGenerateActionContent | WebSearchActionContent;

interface Variable extends NodeBase {
	type: "variable";
	variableContent: VariableContent;
}

interface VariableContentBase {
	type: string;
}

interface TextContent extends VariableContentBase {
	type: "text";
}
interface FileContent extends VariableContentBase {
	type: "file";
}

type VariableContent = TextContent | FileContent;

export interface Text extends Variable {
	content: TextContent;
}
export interface File extends Variable {
	content: FileContent;
}

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
