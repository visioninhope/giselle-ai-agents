import { FlowTrigger, type FlowTriggerId } from "@giselle-sdk/data-type";
import type { Storage } from "unstorage";
import type { GiselleStorage } from "../experimental_storage";
import { removeGitHubRepositoryIntegrationIndex } from "../integrations/utils";

function flowTriggerPath(params: { flowTriggerId: FlowTriggerId }) {
	return `flow-triggers/${params.flowTriggerId}.json`;
}

export async function setFlowTrigger({
	storage,
	experimental_storage,
	flowTrigger,
	useExperimentalStorage = false,
}: {
	storage: Storage;
	experimental_storage: GiselleStorage;
	flowTrigger: FlowTrigger;
	useExperimentalStorage?: boolean;
}) {
	const path = flowTriggerPath({ flowTriggerId: flowTrigger.id });
	if (useExperimentalStorage) {
		await experimental_storage.setJson({
			path,
			data: flowTrigger,
			schema: FlowTrigger,
		});
		return;
	}
	await storage.set(path, flowTrigger);
}

export async function getFlowTrigger({
	storage,
	experimental_storage,
	flowTriggerId,
	useExperimentalStorage = false,
}: {
	storage: Storage;
	flowTriggerId: FlowTriggerId;
	experimental_storage: GiselleStorage;
	useExperimentalStorage?: boolean;
}) {
	const path = flowTriggerPath({
		flowTriggerId,
	});
	if (useExperimentalStorage) {
		const exists = await experimental_storage.exists(path);
		if (!exists) {
			return undefined;
		}
		return await experimental_storage.getJson({
			path,
			schema: FlowTrigger,
		});
	}
	const unsafe = await storage.get(path, {
		bypassingCache: true,
	});
	if (unsafe === null) {
		return undefined;
	}

	return FlowTrigger.parse(unsafe);
}

export async function deleteFlowTrigger({
	storage,
	experimental_storage,
	flowTriggerId,
	useExperimentalStorage = false,
}: {
	storage: Storage;
	flowTriggerId: FlowTriggerId;
	experimental_storage: GiselleStorage;
	useExperimentalStorage?: boolean;
}) {
	const trigger = await getFlowTrigger({
		storage,
		experimental_storage,
		flowTriggerId,
		useExperimentalStorage,
	});
	if (trigger === undefined) {
		throw new Error(`Flow trigger with ID ${flowTriggerId} not found`);
	}
	const path = flowTriggerPath({ flowTriggerId });
	if (useExperimentalStorage) {
		await experimental_storage.remove(path);
	} else {
		await storage.removeItem(path);
	}
	if (trigger.configuration.provider === "github") {
		await removeGitHubRepositoryIntegrationIndex({
			storage,
			experimental_storage,
			flowTriggerId,
			repositoryNodeId: trigger.configuration.repositoryNodeId,
			useExperimentalStorage,
		});
	}
}
