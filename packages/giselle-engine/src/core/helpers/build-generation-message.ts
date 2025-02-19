import type {
	ActionNode,
	FileData,
	Node,
	NodeId,
	TextGenerationNode,
} from "@giselle-sdk/data-type";
import { isJsonContent, jsonContentToText } from "@giselle-sdk/text-editor";
import type { CoreMessage, DataContent, FilePart } from "ai";

export interface FileIndex {
	nodeId: NodeId;
	start: number;
	end: number;
}

export async function buildMessageObject(
	node: ActionNode,
	contextNodes: Node[],
	fileResolver: (file: FileData) => Promise<DataContent>,
	textGenerationResolver: (nodeId: NodeId) => Promise<string | undefined>,
): Promise<CoreMessage[]> {
	switch (node.content.type) {
		case "textGeneration": {
			return await buildGenerationMessageForTextGeneration(
				node,
				contextNodes,
				fileResolver,
				textGenerationResolver,
			);
		}
		default: {
			const _exhaustiveCheck: never = node.content.type;
			throw new Error(`Unhandled content type: ${_exhaustiveCheck}`);
		}
	}
}

function createFileIndices(
	dataContents: { dataContent: DataContent; nodeId: NodeId }[],
): FileIndex[] {
	// Group by nodeId and count positions
	let currentPosition = 1;
	const result: FileIndex[] = [];

	// Group data by nodeId
	const groupedData = dataContents.reduce(
		(acc, curr) => {
			if (!acc[curr.nodeId]) {
				acc[curr.nodeId] = [];
			}
			acc[curr.nodeId].push(curr.dataContent);
			return acc;
		},
		{} as { [key in NodeId]: DataContent[] },
	);

	// Create indices for each group
	for (const [nodeId, items] of Object.entries(groupedData)) {
		result.push({
			nodeId: nodeId as NodeId,
			start: currentPosition,
			end: currentPosition + items.length - 1,
		});
		currentPosition += items.length;
	}

	return result;
}

async function buildGenerationMessageForTextGeneration(
	node: TextGenerationNode,
	contextNodes: Node[],
	fileResolver: (file: FileData) => Promise<DataContent>,
	textGenerationResolver: (nodeId: NodeId) => Promise<string | undefined>,
): Promise<CoreMessage[]> {
	const llmProvider = node.content.llm.provider;
	const prompt = node.content.prompt;
	if (prompt === undefined) {
		throw new Error("Prompt cannot be empty");
	}

	const pattern = /\{\{(nd-[a-zA-Z0-9]+)\}\}/g;
	const sourceKeywords = [...prompt.matchAll(pattern)].map((match) => match[1]);

	const pdfData = await Promise.all(
		contextNodes
			.filter((contextNode) => sourceKeywords.includes(contextNode.id))
			.map(async (contextNode) => {
				if (contextNode.content.type !== "file") {
					return null;
				}
				return await Promise.all(
					contextNode.content.files.map(async (file) => {
						if (
							file.status !== "uploaded" &&
							file.contentType !== "application/pdf"
						) {
							return null;
						}
						const dataContent = await fileResolver(file);
						return {
							dataContent,
							nodeId: contextNode.id,
						};
					}),
				).then((result) => result.filter((dataOrNull) => dataOrNull !== null));
			}),
	)
		.then((result) => result.filter((dataOrNull) => dataOrNull !== null))
		.then((result) =>
			result.flat().sort((a, b) => b.nodeId.localeCompare(a.nodeId)),
		);
	const fileIndices = createFileIndices(pdfData);

	let userMessage = prompt;

	if (isJsonContent(prompt)) {
		userMessage = jsonContentToText(JSON.parse(prompt));
	}
	const attachedFiles: FilePart[] = [];
	for (const sourceKeyword of sourceKeywords) {
		const contextNode = contextNodes.find(
			(contextNode) => contextNode.id === sourceKeyword,
		);
		if (contextNode === undefined) {
			continue;
		}
		switch (contextNode.content.type) {
			case "text": {
				userMessage = userMessage.replace(
					`{{${sourceKeyword}}}`,
					contextNode.content.text,
				);
				break;
			}
			case "textGeneration": {
				const result = await textGenerationResolver(contextNode.id);
				if (result !== undefined) {
					userMessage = userMessage.replace(`{{${sourceKeyword}}}`, result);
				}
				break;
			}
			case "file": {
				switch (contextNode.content.category) {
					case "pdf": {
						const fileContents = await Promise.all(
							contextNode.content.files.map(async (file) => {
								if (file.status !== "uploaded") {
									return null;
								}
								const data = await fileResolver(file);
								return {
									type: "file",
									data,
									mimeType: "application/pdf",
								} satisfies FilePart;
							}),
						).then((results) => results.filter((result) => result !== null));
						if (fileContents.length > 1) {
							userMessage = userMessage.replace(
								`{{${sourceKeyword}}}`,
								`${getOrdinal(attachedFiles.length + 1)} ~ ${getOrdinal(attachedFiles.length + fileContents.length)} attached files`,
							);
						} else {
							userMessage = userMessage.replace(
								`{{${sourceKeyword}}}`,
								`${getOrdinal(attachedFiles.length + 1)} attached file`,
							);
						}
						attachedFiles.push(...fileContents);
						break;
					}
					case "text":
						throw new Error("Not implemented");
					default: {
						const _exhaustiveCheck: never = contextNode.content.category;
						throw new Error(`Unhandled category: ${_exhaustiveCheck}`);
					}
				}
			}
		}
	}

	switch (llmProvider) {
		case "openai": {
			return [
				{
					role: "user",
					content: [
						{
							type: "text",
							text: userMessage,
						},
					],
				},
			];
		}
		case "anthropic":
		case "google": {
			return [
				{
					role: "user",
					content: [
						...attachedFiles,
						{
							type: "text",
							text: userMessage,
						},
					],
				},
			];
		}
		default: {
			const _exhaustiveCheck: never = llmProvider;
			throw new Error(`Unhandled provider: ${_exhaustiveCheck}`);
		}
	}
}

function getOrdinal(n: number): string {
	const rules = new Intl.PluralRules("en", { type: "ordinal" });
	const suffixes: { [key: string]: string } = {
		one: "st",
		two: "nd",
		few: "rd",
		other: "th",
	};
	const suffix = suffixes[rules.select(n)];
	return `${n}${suffix}`;
}
