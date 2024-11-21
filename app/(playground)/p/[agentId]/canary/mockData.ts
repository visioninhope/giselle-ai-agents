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

export const nodes = [
	outlineNode,
	sectionNode1,
	sectionNode2,
	concatNode,
	reviewNode,
	fileNode,
	textNode,
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
];

export const defaultNodes: Node[] = [
	{
		id: "nd_123",
		position: { x: 120, y: 200 },
		type: "giselleNode",
		data: {
			node: {
				id: "nd_123",
				name: "Untitled Node - 1",
				position: { x: 120, y: 200 },
				type: "action",
				content: {
					type: "textGeneration",
					llm: "gpt2",
					temperature: 0.7,
					topP: 1,
					instruction: "Write a short story about a cat",
					requirement: { id: "ndh_123", label: "Requirement" },
					sources: [
						{
							id: "ndh_source1",
							label: "Source1",
						},
					],
				},
			},
		},
	},
	{
		id: "nd_456",
		position: { x: 320, y: 200 },
		type: "giselleNode",
		data: {
			node: {
				id: "nd_456",
				name: "Untitled Node - 2",
				position: { x: 320, y: 200 },
				type: "action",
				content: {
					type: "textGeneration",
					llm: "gpt2",
					temperature: 0.7,
					topP: 1,
					instruction: "Write a short story about a cat",
					requirement: { id: "ndh_123", label: "Requirement" },
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
			},
		},
	},
	{
		id: "nd_789",
		position: { x: 220, y: 400 },
		type: "giselleNode",
		data: {
			node: {
				id: "nd_789",
				name: "Untitled Node - 3",
				position: { x: 220, y: 200 },
				type: "variable",
				content: {
					type: "text",
				},
			},
		},
	},
	{
		id: "nd_321",
		position: { x: 220, y: 600 },
		type: "giselleNode",
		data: {
			node: {
				id: "nd_321",
				name: "Untitled Node - 4",
				position: { x: 220, y: 600 },
				type: "variable",
				content: {
					type: "file",
				},
			},
		},
	},
];

export const defaultEdges: Edge[] = [
	{
		id: "ed_123",
		source: "nd_789",
		target: "nd_123",
		targetHandle: "ndh_123",
		type: "giselleEdge",
		data: {
			connection: {
				sourceNodeId: "nd_789",
				sourceNodeType: "variable",
				targetNodeId: "nd_123",
				targetNodeHandleId: "ndh_123",
				targetNodeType: "action",
			},
		},
	},
	{
		id: "ed_456",
		source: "nd_789",
		target: "nd_456",
		targetHandle: "ndh_123",
		type: "giselleEdge",
		data: {
			connection: {
				sourceNodeId: "nd_789",
				sourceNodeType: "variable",
				targetNodeId: "nd_456",
				targetNodeHandleId: "ndh_123",
				targetNodeType: "action",
			},
		},
	},
	{
		id: "ed_789",
		source: "nd_123",
		target: "nd_456",
		targetHandle: "ndh_source1",
		type: "giselleEdge",
		data: {
			connection: {
				sourceNodeId: "nd_123",
				sourceNodeType: "action",
				targetNodeId: "nd_456",
				targetNodeHandleId: "ndh_source1",
				targetNodeType: "action",
			},
		},
	},
	{
		id: "ed_1",
		source: "nd_321",
		target: "nd_123",
		targetHandle: "ndh_source1",
		type: "giselleEdge",
		data: {
			connection: {
				sourceNodeId: "nd_321",
				sourceNodeType: "variable",
				targetNodeId: "nd_123",
				targetNodeHandleId: "ndh_source1",
				targetNodeType: "action",
			},
		},
	},
	{
		id: "ed_2",
		source: "nd_321",
		target: "nd_456",
		targetHandle: "ndh_source2",
		type: "giselleEdge",
		data: {
			connection: {
				sourceNodeId: "nd_321",
				sourceNodeType: "variable",
				targetNodeId: "nd_456",
				targetNodeHandleId: "ndh_source2",
				targetNodeType: "action",
			},
		},
	},
];
