import type { WorkspaceId } from "@giselle-sdk/data-type";
import type { Storage } from "unstorage";
import { z } from "zod/v4";
import type { GiselleEngineContext } from "../types";
import { createVectorStore } from "../vector-store/create-vector-store";
import {
	DataSourceId,
	DataSourceIndexObject,
	DataSourceObject,
	type DataSourceProviderObject,
} from "./object";
import { dataSourcePath, workspaceDataSourceIndexPath } from "./paths";

export async function createDataSource(
	args: {
		context: GiselleEngineContext;
		workspaceId: WorkspaceId;
	} & DataSourceProviderObject,
) {
	const vectorStore = await createVectorStore(args);
	let dataSource: DataSourceObject | undefined;
	switch (args.provider) {
		case "github":
			dataSource = {
				id: DataSourceId.generate(),
				status: "inProgress",
				vectorStoreId: vectorStore.id,
				provider: args.provider,
				providerMetadata: args.providerMetadata,
				workspaceId: args.workspaceId,
			};
	}
	if (dataSource === undefined) {
		throw new Error(`Unknown data source provider: ${args.provider}`);
	}
	await Promise.all([
		args.context.storage.setItem(dataSourcePath(dataSource.id), dataSource),
		addWorkspaceSecretIndex({
			dataSource,
			storage: args.context.storage,
		}),
	]);
}

async function addWorkspaceSecretIndex(args: {
	dataSource: DataSourceObject;
	storage: Storage;
}) {
	const workspaceDataSourceIndexLike = await args.storage.getItem(
		workspaceDataSourceIndexPath(args.dataSource.workspaceId),
	);
	const parse = z
		.array(DataSourceObject)
		.safeParse(workspaceDataSourceIndexLike);
	const current = parse.success ? parse.data : [];

	await args.storage.setItem(
		workspaceDataSourceIndexPath(args.dataSource.workspaceId),
		[...current, DataSourceIndexObject.parse(args.dataSource)],
	);
}
