import type { WorkspaceId } from "@giselle-sdk/data-type";
import type { Storage } from "unstorage";
import { z } from "zod/v4";
import type { GiselleEngineContext } from "../types";
import { createVectorStore } from "../vector-store/create-vector-store";
import { dataSourcePath, workspaceDataSourceIndexPath } from "./paths";
import {
	DataSourceId,
	DataSourceIndexObject,
	DataSourceObject,
	type DataSourceProviderObject,
} from "./types/object";

export async function createDataSource(args: {
	context: GiselleEngineContext;
	workspaceId: WorkspaceId;
	dataSource: DataSourceProviderObject;
}) {
	const vectorStore = await createVectorStore(args);
	let dataSource: DataSourceObject | undefined;
	switch (args.dataSource.provider) {
		case "github":
			dataSource = {
				id: DataSourceId.generate(),
				status: "inProgress",
				vectorStoreId: vectorStore.id,
				provider: args.dataSource.provider,
				providerMetadata: args.dataSource.providerMetadata,
				workspaceId: args.workspaceId,
			};
	}
	if (dataSource === undefined) {
		throw new Error(
			`Unknown data source provider: ${args.dataSource.provider}`,
		);
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
