import {
	type FlowTriggerId,
	GitHubRepositoryIntegrationIndex,
} from "@giselle-sdk/data-type";
import type { Storage } from "unstorage";
import type { GiselleStorage } from "../experimental_storage";

function getGitHubRepositoryIntegrationPath(repositoryNodeId: string): string {
	return `integrations/github/repositories/${repositoryNodeId}.json`;
}

export async function getGitHubRepositoryIntegrationIndex(args: {
	storage: Storage;
	experimental_storage: GiselleStorage;
	repositoryNodeId: string;
	useExperimentalStorage?: boolean;
}) {
	const path = getGitHubRepositoryIntegrationPath(args.repositoryNodeId);
	if (args.useExperimentalStorage) {
		const exists = await args.experimental_storage.exists(path);
		if (!exists) {
			return undefined;
		}
		return await args.experimental_storage.getJson({
			path,
			schema: GitHubRepositoryIntegrationIndex,
		});
	}
	const unsafe = await args.storage.get(path);
	if (unsafe === null) {
		return undefined;
	}
	return GitHubRepositoryIntegrationIndex.parse(unsafe);
}

async function setGitHubRepositoryIntegrationIndex(args: {
	storage: Storage;
	experimental_storage: GiselleStorage;
	repositoryNodeId: string;
	index: GitHubRepositoryIntegrationIndex;
	useExperimentalStorage?: boolean;
}) {
	const path = getGitHubRepositoryIntegrationPath(args.repositoryNodeId);
	if (args.useExperimentalStorage) {
		await args.experimental_storage.setJson({
			path,
			data: args.index,
			schema: GitHubRepositoryIntegrationIndex,
		});
		return;
	}
	await args.storage.set(path, args.index);
}

export async function addGitHubRepositoryIntegrationIndex(args: {
	storage: Storage;
	experimental_storage: GiselleStorage;
	flowTriggerId: FlowTriggerId;
	repositoryNodeId: string;
	useExperimentalStorage?: boolean;
}) {
	const githubRepositoryIntegrationIndex =
		await getGitHubRepositoryIntegrationIndex({
			storage: args.storage,
			repositoryNodeId: args.repositoryNodeId,
			experimental_storage: args.experimental_storage,
			useExperimentalStorage: args.useExperimentalStorage,
		});

	const currentFlowTriggerIds =
		githubRepositoryIntegrationIndex?.flowTriggerIds ?? [];
	await setGitHubRepositoryIntegrationIndex({
		storage: args.storage,
		repositoryNodeId: args.repositoryNodeId,
		experimental_storage: args.experimental_storage,
		useExperimentalStorage: args.useExperimentalStorage,
		index: {
			repositoryNodeId: args.repositoryNodeId,
			flowTriggerIds: [...currentFlowTriggerIds, args.flowTriggerId],
		},
	});
}

export async function removeGitHubRepositoryIntegrationIndex(args: {
	storage: Storage;
	experimental_storage: GiselleStorage;
	flowTriggerId: FlowTriggerId;
	repositoryNodeId: string;
	useExperimentalStorage?: boolean;
}) {
	const githubRepositoryIntegrationIndex =
		await getGitHubRepositoryIntegrationIndex({
			storage: args.storage,
			repositoryNodeId: args.repositoryNodeId,
			experimental_storage: args.experimental_storage,
			useExperimentalStorage: args.useExperimentalStorage,
		});
	if (githubRepositoryIntegrationIndex === undefined) {
		return;
	}
	const remainingFlowTriggerIds =
		githubRepositoryIntegrationIndex.flowTriggerIds.filter(
			(id) => id !== args.flowTriggerId,
		);
	if (remainingFlowTriggerIds.length === 0) {
		const path = getGitHubRepositoryIntegrationPath(args.repositoryNodeId);
		if (args.useExperimentalStorage) {
			await args.experimental_storage.remove(path);
			return;
		}
		await args.storage.removeItem(path);
		return;
	}
	await setGitHubRepositoryIntegrationIndex({
		storage: args.storage,
		repositoryNodeId: args.repositoryNodeId,
		experimental_storage: args.experimental_storage,
		useExperimentalStorage: args.useExperimentalStorage,
		index: {
			repositoryNodeId: args.repositoryNodeId,
			flowTriggerIds: remainingFlowTriggerIds,
		},
	});
}
