import type { NodeId, OutputId } from "@giselle-sdk/data-type";
import { isJsonContent } from "./is-json-content";
import { findNextNodeReference, formatNodeReference } from "./node-reference";

/**
 * Helper function to process content arrays while maintaining immutability
 */
function processContentArray<T>(
	content: Record<string, unknown>,
	processor: (child: unknown) => T | null,
): Record<string, unknown> {
	if (!Array.isArray(content.content)) {
		return content;
	}

	const processedContent = content.content
		.map(processor)
		.filter((child) => child !== null);

	// Return a new object with all properties copied and the new content array
	return {
		...content,
		content: processedContent,
	};
}

function cleanupNodeReferencesInJsonContent(
	jsonContent: unknown,
	deletedNodeId: NodeId,
): unknown {
	if (!jsonContent || typeof jsonContent !== "object") {
		return jsonContent;
	}

	const content = jsonContent as Record<string, unknown>;

	// If this is a Source node with the deleted nodeId, remove it
	if (
		content.type === "Source" &&
		typeof content.attrs === "object" &&
		content.attrs !== null
	) {
		const attrs = content.attrs as Record<string, unknown>;
		if (
			attrs.node !== null &&
			typeof attrs.node === "object" &&
			attrs.node !== null
		) {
			const node = attrs.node as Record<string, unknown>;
			if (node.id === deletedNodeId) {
				return null;
			}
		}
	}

	// Recursively process content array
	return processContentArray(content, (child) =>
		cleanupNodeReferencesInJsonContent(child, deletedNodeId),
	);
}

export function cleanupNodeReferencesInText(
	text: string,
	deletedNodeId: NodeId,
): string {
	// Handle JSON content (rich text from TipTap editor)
	if (isJsonContent(text)) {
		try {
			const jsonContent = JSON.parse(text);
			const cleaned = cleanupNodeReferencesInJsonContent(
				jsonContent,
				deletedNodeId,
			);
			return JSON.stringify(cleaned);
		} catch (error) {
			console.error("Failed to parse JSON content:", error);
		}
	}

	// Handle plain text with {{nodeId:outputId}} references
	let result = text;
	let searchStart = 0;

	while (true) {
		const reference = findNextNodeReference(result, deletedNodeId, searchStart);
		if (!reference) break;

		result =
			result.substring(0, reference.start) + result.substring(reference.end);
		searchStart = reference.start;
	}

	return result;
}

/**
 * Clean up specific node reference (nodeId:outputId) from JSON content
 */
function cleanupSpecificNodeReferenceInJsonContent(
	jsonContent: unknown,
	nodeId: NodeId,
	outputId: OutputId,
): unknown {
	if (!jsonContent || typeof jsonContent !== "object") {
		return jsonContent;
	}

	const content = jsonContent as Record<string, unknown>;

	// If this is a Source node with the specific nodeId and outputId, remove it
	if (
		content.type === "Source" &&
		typeof content.attrs === "object" &&
		content.attrs !== null
	) {
		const attrs = content.attrs as Record<string, unknown>;
		if (
			attrs.node !== null &&
			typeof attrs.node === "object" &&
			attrs.node !== null
		) {
			const node = attrs.node as Record<string, unknown>;
			if (node.id === nodeId && attrs.outputId === outputId) {
				return null;
			}
		}
	}

	// Recursively process content array
	const processedContent = processContentArray(content, (child) =>
		cleanupSpecificNodeReferenceInJsonContent(child, nodeId, outputId),
	);

	// Remove empty paragraph nodes
	if (
		processedContent.type === "paragraph" &&
		Array.isArray(processedContent.content)
	) {
		if (processedContent.content.length === 0) {
			return null;
		}
		// Check if paragraph only contains empty text nodes
		const hasOnlyEmptyText = processedContent.content.every(
			(child: unknown) => {
				if (typeof child === "object" && child !== null) {
					const textNode = child as Record<string, unknown>;
					return (
						textNode.type === "text" &&
						(textNode.text === "" || textNode.text === " ")
					);
				}
				return false;
			},
		);
		if (hasOnlyEmptyText) {
			return null;
		}
	}

	return processedContent;
}

/**
 * Clean up specific node reference (nodeId:outputId) from text
 */
export function cleanupSpecificNodeReferenceInText(
	text: string,
	nodeId: NodeId,
	outputId: OutputId,
): string {
	// Handle JSON content (rich text from TipTap editor)
	if (isJsonContent(text)) {
		try {
			const jsonContent = JSON.parse(text);
			const cleaned = cleanupSpecificNodeReferenceInJsonContent(
				jsonContent,
				nodeId,
				outputId,
			);
			return JSON.stringify(cleaned);
		} catch (error) {
			console.error("Failed to parse JSON content:", error);
		}
	}

	// Handle plain text with specific {{nodeId:outputId}} reference
	const targetReference = formatNodeReference(nodeId, outputId);
	let result = text;
	let searchStart = 0;

	while (true) {
		const startIndex = result.indexOf(targetReference, searchStart);
		if (startIndex === -1) break;

		const endIndex = startIndex + targetReference.length;
		result = result.substring(0, startIndex) + result.substring(endIndex);
		searchStart = startIndex;
	}

	return result;
}
