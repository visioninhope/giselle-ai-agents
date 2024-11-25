export type NodeId = `nd_${string}`;
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
export interface TextGenerateActionContent extends ActionContentBase {
	type: "textGeneration";
	llm: string;
	temperature: number;
	topP: number;
	instruction: string;
	requirement?: NodeHandle;
	sources: NodeHandle[];
}
export interface TextGeneration extends Action {
	content: TextGenerateActionContent;
}
interface WebSearchActionContent extends ActionContentBase {
	type: "webSearch";
}
export interface WebSearch extends Action {
	content: WebSearchActionContent;
}
type ActionContent = TextGenerateActionContent | WebSearchActionContent;

interface Variable extends NodeBase {
	type: "variable";
	content: VariableContent;
}

interface VariableContentBase {
	type: string;
}

interface TextContent extends VariableContentBase {
	type: "text";
	text: string;
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

export type NodeHandleId = `ndh_${string}`;
interface NodeHandle {
	id: NodeHandleId;
	label: string;
}

export type Node = Action | Variable;

type ConnectionId = `cnnc_${string}`;
export interface Connection {
	id: ConnectionId;
	sourceNodeId: NodeId;
	sourceNodeHandleId?: NodeHandleId;
	sourceNodeType: Node["type"];
	targetNodeId: NodeId;
	targetNodeHandleId?: NodeHandleId;
	targetNodeType: Node["type"];
}

type ArtifactId = `artf_${string}`;
interface ArtifactBase {
	id: ArtifactId;
	type: string;
	creatorNodeId: NodeId;
	createdAt: number;
}
interface TextArtifact extends ArtifactBase {
	type: "text";
	title: string;
	content: string;
	messages: {
		plan: string;
		description: string;
	};
}
export type Artifact = TextArtifact;

export interface Graph {
	nodes: Node[];
	connections: Connection[];
	artifacts: Artifact[];
}
