import {
	Generation,
	type GenerationId,
	GenerationIndex,
	type GenerationOrigin,
	NodeGenerationIndex,
	type NodeId,
} from "@giselle-sdk/data-type";
import type { Storage } from "unstorage";

function generationIndexPath(generationId: GenerationId) {
	return `generations/${generationId}.json`;
}
export async function getGenerationIndex(params: {
	storage: Storage;
	generationId: GenerationId;
}) {
	const unsafeGenerationIndex = await params.storage.getItem(
		generationIndexPath(params.generationId),
	);
	if (unsafeGenerationIndex === null) {
		return undefined;
	}
	return GenerationIndex.parse(unsafeGenerationIndex);
}
export async function setGenerationIndex(params: {
	storage: Storage;
	generationIndex: GenerationIndex;
}) {
	await params.storage.setItem(
		generationIndexPath(params.generationIndex.id),
		GenerationIndex.parse(params.generationIndex),
		{
			// Disable caching by setting cacheControlMaxAge to 0 for Vercel Blob storage
			cacheControlMaxAge: 0,
		},
	);
}
export function generationPath(generationIndex: GenerationIndex) {
	const generationOrigin = generationIndex.origin;
	const originType = generationOrigin.type;
	switch (originType) {
		case "workspace":
			return `workspaces/${generationOrigin.id}/generations/${generationIndex.id}.json`;
		case "run":
			return `runs/${generationOrigin.id}/generations/${generationIndex.id}.json`;
		default: {
			const _exhaustiveCheck: never = originType;
			return _exhaustiveCheck;
		}
	}
}

export function activeNodeGenerationIdPath(
	params: {
		storage: Storage;
		nodeId: NodeId;
	} & { origin: GenerationOrigin },
) {
	switch (params.origin.type) {
		case "workspace":
			return `workspaces/${params.origin.id}/node-generations/${params.nodeId}/activeGenerationId.txt`;
		case "run":
			return `runs/${params.origin.id}/node-generations/${params.nodeId}/activeGenerationId.txt`;
		default: {
			const _exhaustiveCheck: never = params.origin;
			return _exhaustiveCheck;
		}
	}
}

export async function setGeneration(params: {
	storage: Storage;
	generation: Generation;
}) {
	await params.storage.setItem(
		generationPath({
			id: params.generation.id,
			origin: params.generation.context.origin,
		}),
		Generation.parse(params.generation),
		{
			// Disable caching by setting cacheControlMaxAge to 0 for Vercel Blob storage
			cacheControlMaxAge: 0,
		},
	);
}

export async function getGeneration(params: {
	storage: Storage;
	generationId: GenerationId;
}): Promise<Generation | undefined> {
	const generationIndex = await getGenerationIndex({
		storage: params.storage,
		generationId: params.generationId,
	});
	if (generationIndex == null) {
		throw new Error("Generation not found");
	}
	const unsafeGeneration = await params.storage.getItem(
		generationPath(generationIndex),
	);
	return Generation.parse(unsafeGeneration);
}

export function nodeGenerationIndexPath(
	params: {
		storage: Storage;
		nodeId: NodeId;
	} & { origin: GenerationOrigin },
) {
	switch (params.origin.type) {
		case "workspace":
			return `workspaces/${params.origin.id}/node-generations/${params.nodeId}.json`;
		case "run":
			return `runs/${params.origin.id}/node-generations/${params.nodeId}.json`;
		default: {
			const _exhaustiveCheck: never = params.origin;
			return _exhaustiveCheck;
		}
	}
}
export async function setNodeGenerationIndex(
	params: {
		storage: Storage;
		nodeId: NodeId;
		nodeGenerationIndex: NodeGenerationIndex;
	} & { origin: GenerationOrigin },
) {
	let newNodeGenerationIndexes: NodeGenerationIndex[] | undefined;
	const nodeGenerationIndexes = await getNodeGenerationIndexes({
		storage: params.storage,
		nodeId: params.nodeId,
		origin: params.origin,
	});
	if (nodeGenerationIndexes === undefined) {
		newNodeGenerationIndexes = [params.nodeGenerationIndex];
	} else {
		const index = nodeGenerationIndexes.findIndex(
			(nodeGenerationIndex) =>
				nodeGenerationIndex.id === params.nodeGenerationIndex.id,
		);
		if (index === -1) {
			newNodeGenerationIndexes = [
				...nodeGenerationIndexes,
				params.nodeGenerationIndex,
			];
		} else {
			newNodeGenerationIndexes = [
				...nodeGenerationIndexes.slice(0, index),
				params.nodeGenerationIndex,
				...nodeGenerationIndexes.slice(index + 1),
			];
		}
	}
	await params.storage.setItem(
		nodeGenerationIndexPath(params),
		newNodeGenerationIndexes,
		{
			// Disable caching by setting cacheControlMaxAge to 0 for Vercel Blob storage
			cacheControlMaxAge: 0,
		},
	);
}

export async function getNodeGenerationIndexes(
	params: {
		storage: Storage;
		nodeId: NodeId;
	} & { origin: GenerationOrigin },
) {
	const unsafeNodeGenerationIndexData = await params.storage.getItem(
		nodeGenerationIndexPath(params),
	);
	if (unsafeNodeGenerationIndexData === null) {
		return undefined;
	}
	return NodeGenerationIndex.array().parse(unsafeNodeGenerationIndexData);
}
