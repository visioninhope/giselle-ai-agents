"use server";

import { db, nodesBlueprints, portsBlueprints } from "@/drizzle";
import { and, eq } from "drizzle-orm";

type DeletePortArgs = {
	blueprintId: number;
	deletePortId: number;
};

export const deletePort = async ({
	blueprintId,
	deletePortId,
}: DeletePortArgs) => {
	const [relation] = await db
		.select({
			portId: portsBlueprints.portId,
			nodesBlueprintsId: nodesBlueprints.id,
			blueprintId: nodesBlueprints.blueprintId,
		})
		.from(portsBlueprints)
		.innerJoin(
			nodesBlueprints,
			eq(nodesBlueprints.id, portsBlueprints.nodesBlueprintsId),
		)
		.where(
			and(
				eq(portsBlueprints.portId, deletePortId),
				eq(nodesBlueprints.blueprintId, blueprintId),
			),
		);
	await db
		.delete(portsBlueprints)
		.where(
			and(
				eq(portsBlueprints.portId, deletePortId),
				eq(portsBlueprints.nodesBlueprintsId, relation.nodesBlueprintsId),
			),
		);
};
