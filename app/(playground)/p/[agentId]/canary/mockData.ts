import type { Connection, Node } from "./types";

const outlineNode: Node = {
	id: "nd_outline",
	name: "Untitled Node - 1",
	position: { x: 0, y: 0 },
	type: "action",
	content: {
		type: "textGeneration",
		llm: "gpt2",
		temperature: 0.7,
		topP: 1,
		instruction: "Write a short story about a cat",
		sources: [
			{
				id: "ndh_source1",
				label: "Source1",
			},
			{
				id: "ndh_source2",
				label: "Source2",
			},
		],
	},
};

const sectionNode1: Node = {
	id: "nd_section1",
	name: "Untitled Node - 2",
	position: { x: 100, y: 0 },
	type: "action",
	content: {
		type: "textGeneration",
		llm: "gpt2",
		temperature: 0.7,
		topP: 1,
		instruction: "Write a short story about a cat",
		requirement: { id: "ndh_requirement", label: "Requirement" },
		sources: [
			{
				id: "ndh_source1",
				label: "Source1",
			},
			{
				id: "ndh_source2",
				label: "Source2",
			},
			{
				id: "ndh_source3",
				label: "Source3",
			},
		],
	},
};

const sectionNode2: Node = {
	id: "nd_section2",
	name: "Untitled Node - 3",
	position: { x: 200, y: 0 },
	type: "action",
	content: {
		type: "textGeneration",
		llm: "gpt2",
		temperature: 0.7,
		topP: 1,
		instruction: "Write a short story about a cat",
		requirement: { id: "ndh_requirement", label: "Requirement" },
		sources: [
			{
				id: "ndh_source1",
				label: "Source1",
			},
			{
				id: "ndh_source2",
				label: "Source2",
			},
			{
				id: "ndh_source3",
				label: "Source3",
			},
		],
	},
};

const concatNode: Node = {
	id: "nd_concat",
	name: "Untitled Node - 4",
	position: { x: 300, y: 0 },
	type: "action",
	content: {
		type: "textGeneration",
		llm: "gpt2",
		temperature: 0.7,
		topP: 1,
		instruction: "Write a short story about a cat",
		sources: [
			{
				id: "ndh_source1",
				label: "Source1",
			},
			{
				id: "ndh_source2",
				label: "Source2",
			},
		],
	},
};

const reviewNode: Node = {
	id: "nd_review",
	name: "Untitled Node - 5",
	position: { x: 400, y: 0 },
	type: "action",
	content: {
		type: "textGeneration",
		llm: "gpt2",
		temperature: 0.7,
		topP: 1,
		instruction: "Write a short story about a cat",
		sources: [
			{
				id: "ndh_source1",
				label: "Source1",
			},
			{
				id: "ndh_source2",
				label: "Source2",
			},
			{
				id: "ndh_source3",
				label: "Source3",
			},
		],
	},
};

const fileNode: Node = {
	id: "nd_file",
	name: "Untitled Node - 6",
	position: { x: 500, y: 0 },
	type: "variable",
	content: {
		type: "file",
	},
};

const textNode: Node = {
	id: "nd_text",
	name: "Untitled Node - 7",
	position: { x: 600, y: 0 },
	type: "variable",
	content: {
		type: "text",
	},
};

const webSearchNode: Node = {
	id: "nd_web-search",
	name: "Untitled Node - 8",
	position: { x: 700, y: 0 },
	type: "action",
	content: {
		type: "webSearch",
	},
};

export const nodes = [
	outlineNode,
	sectionNode1,
	sectionNode2,
	concatNode,
	reviewNode,
	fileNode,
	textNode,
	webSearchNode,
] as const;

const fileOutlineConnection: Connection = {
	id: "cnnc_file-outline",
	sourceNodeId: fileNode.id,
	sourceNodeType: "variable",
	targetNodeId: outlineNode.id,
	targetNodeType: "action",
	targetNodeHandleId: "ndh_source1",
};

const fileSection1Connection: Connection = {
	id: "cnnc_file-section1",
	sourceNodeId: fileNode.id,
	sourceNodeType: "variable",
	targetNodeId: sectionNode1.id,
	targetNodeType: "action",
	targetNodeHandleId: "ndh_source1",
};
const fileSection2Connection: Connection = {
	id: "cnnc_file-section2",
	sourceNodeId: fileNode.id,
	sourceNodeType: "variable",
	targetNodeId: sectionNode2.id,
	targetNodeType: "action",
	targetNodeHandleId: "ndh_source1",
};

const fileReviewConnection: Connection = {
	id: "cnnc_file-review",
	sourceNodeId: fileNode.id,
	sourceNodeType: "variable",
	targetNodeId: reviewNode.id,
	targetNodeType: "action",
	targetNodeHandleId: "ndh_source1",
};

const textSection1Connection: Connection = {
	id: "cnnc_text-section1",
	sourceNodeId: textNode.id,
	sourceNodeType: "variable",
	targetNodeId: sectionNode1.id,
	targetNodeType: "action",
	targetNodeHandleId: "ndh_source2",
};

const textSection2Connection: Connection = {
	id: "cnnc_text-section2",
	sourceNodeId: textNode.id,
	sourceNodeType: "variable",
	targetNodeId: sectionNode2.id,
	targetNodeType: "action",
	targetNodeHandleId: "ndh_source2",
};

const outlineToSection1Connection: Connection = {
	id: "cnnc_outline-section1",
	sourceNodeId: outlineNode.id,
	sourceNodeType: "action",
	targetNodeId: sectionNode1.id,
	targetNodeType: "action",
	targetNodeHandleId: "ndh_requirement",
};

const outlineToSection2Connection: Connection = {
	id: "cnnc_outline-section2",
	sourceNodeId: outlineNode.id,
	sourceNodeType: "action",
	targetNodeId: sectionNode2.id,
	targetNodeType: "action",
	targetNodeHandleId: "ndh_requirement",
};
const section1ToConcatConnection: Connection = {
	id: "cnnc_section1-concat",
	sourceNodeId: sectionNode1.id,
	sourceNodeType: "action",
	targetNodeId: concatNode.id,
	targetNodeType: "action",
	targetNodeHandleId: "ndh_source1",
};
const section2ToConcatConnection: Connection = {
	id: "cnnc_section2-concat",
	sourceNodeId: sectionNode2.id,
	sourceNodeType: "action",
	targetNodeId: concatNode.id,
	targetNodeType: "action",
	targetNodeHandleId: "ndh_source2",
};
const concatToReviewConnection: Connection = {
	id: "cnnc_concat-review",
	sourceNodeId: concatNode.id,
	sourceNodeType: "action",
	targetNodeId: reviewNode.id,
	targetNodeType: "action",
	targetNodeHandleId: "ndh_source2",
};

const webSearchToOutlineConnection: Connection = {
	id: "cnnc_web-search-outline",
	sourceNodeId: webSearchNode.id,
	sourceNodeType: "action",
	targetNodeId: outlineNode.id,
	targetNodeType: "action",
	targetNodeHandleId: "ndh_source2",
};
const webSearchToSection1Connection: Connection = {
	id: "cnnc_web-search-section1",
	sourceNodeId: webSearchNode.id,
	sourceNodeType: "action",
	targetNodeId: sectionNode1.id,
	targetNodeType: "action",
	targetNodeHandleId: "ndh_source3",
};
const webSearchToSection2Connection: Connection = {
	id: "cnnc_web-search-section2",
	sourceNodeId: webSearchNode.id,
	sourceNodeType: "action",
	targetNodeId: sectionNode2.id,
	targetNodeType: "action",
	targetNodeHandleId: "ndh_source3",
};
const webSearchToReviewConnection: Connection = {
	id: "cnnc_web-search-review",
	sourceNodeId: webSearchNode.id,
	sourceNodeType: "action",
	targetNodeId: reviewNode.id,
	targetNodeType: "action",
	targetNodeHandleId: "ndh_source3",
};

export const connections = [
	fileOutlineConnection,
	fileSection1Connection,
	fileSection2Connection,
	fileReviewConnection,
	textSection1Connection,
	textSection2Connection,
	outlineToSection1Connection,
	outlineToSection2Connection,
	section1ToConcatConnection,
	section2ToConcatConnection,
	concatToReviewConnection,
	webSearchToOutlineConnection,
	webSearchToSection1Connection,
	webSearchToSection2Connection,
	webSearchToReviewConnection,
];
