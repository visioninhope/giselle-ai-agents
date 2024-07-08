import { createNodeStructure } from "./strcture";

const loopNodeStructure = createNodeStructure({
	key: "Loop",
	kind: "action",
	name: "Loop",
	inputs: [
		{
			key: "execFrom",
			kind: "execution",
		},
		{
			key: "iterationObject",
			kind: "data",
			dataType: "string",
			array: true,
			label: "Array",
		},
	],
	outputs: [
		{ key: "loopBody", kind: "execution", label: "Loop Body" },
		{
			key: "arrayItem",
			kind: "data",
			dataType: "elementOfInputData",
			label: "Array Item",
			inputPinKey: "iterationObject",
		},
		{ key: "completed", kind: "execution", label: "Completed" },
	],
});

const contextNodeStructure = createNodeStructure({
	key: "Context",
	kind: "context",
	name: "Read Context",
	outputs: [
		{
			key: "context",
			kind: "data",
			dataType: (dataType) => dataType,
			label: (label) => label,
		},
	],
});

const createDocumentNodeStructure = createNodeStructure({
	key: "CreateDocument",
	kind: "action",
	name: "Create Document",
	inputs: [
		{
			key: "execFrom",
			kind: "execution",
		},
		{
			key: "input",
			kind: "data",
			dataType: "string",
		},
	],
	outputs: [
		{ key: "execTo", kind: "execution" },
		{
			key: "document",
			kind: "data",
			dataType: "string",
			label: "Document",
		},
	],
});

const appendValueToContextNodeStructure = createNodeStructure({
	key: "AppendValueToContext",
	kind: "action",
	name: (name = "Context") => `Append Value To ${name}`,
	inputs: [
		{
			key: "execFrom",
			kind: "execution",
		},
		{
			key: "value",
			kind: "data",
			dataType: "string",
			label: "Value",
		},
	],
	outputs: [{ key: "execTo", kind: "execution" }],
});

const textGenerationNodeStructure = createNodeStructure({
	key: "TextGeneration",
	kind: "action",
	name: "Text Generation",
	inputs: [
		{
			key: "execFrom",
			kind: "execution",
		},
	],
	outputs: [
		{ key: "execTo", kind: "execution" },
		{
			key: "text",
			kind: "data",
			dataType: "string",
			label: "Return value",
		},
	],
});

const findUserNodeStructure = createNodeStructure({
	key: "FindUser",
	kind: "action",
	name: "Find User",
	inputs: [
		{
			key: "execFrom",
			kind: "execution",
		},
	],
	outputs: [
		{ key: "execTo", kind: "execution" },
		{
			key: "user",
			kind: "data",
			dataType: "string",
			label: "UserID",
		},
	],
});

const sendMailNodeStructure = createNodeStructure({
	key: "SendMail",
	kind: "action",
	name: "Send Mail",
	inputs: [
		{
			key: "execFrom",
			kind: "execution",
		},
		{
			key: "user",
			kind: "data",
			dataType: "string",
			label: "UserID",
		},
	],
	outputs: [{ key: "execTo", kind: "execution" }],
});
const variableNodeStructure = createNodeStructure({
	key: "Variable",
	kind: "action",
	name: "Variable",
	inputs: [],
	outputs: [{ key: "value", kind: "data", dataType: "string", label: "Value" }],
});

export const nodeStructures = [
	loopNodeStructure,
	contextNodeStructure,
	createDocumentNodeStructure,
	appendValueToContextNodeStructure,
	textGenerationNodeStructure,
	findUserNodeStructure,
	sendMailNodeStructure,
	variableNodeStructure,
];
export type NodeStructures = typeof nodeStructures;
export type NodeStructureKey = NodeStructures[number]["key"];
