"use server";

import {
	blueprints,
	db,
	nodesBlueprints,
	ports,
	portsBlueprints,
} from "@/drizzle";
import { and, desc, eq } from "drizzle-orm";
import type { BlueprintPort } from "../blueprint";

type AddNodePortArgs = {
	blueprintId: number;
	port: Pick<typeof ports.$inferInsert, "nodeId" | "name" | "direction">;
};

export const addNodePort = async ({
	port,
	blueprintId,
}: AddNodePortArgs): Promise<{ port: BlueprintPort }> => {
	const lastPort = await db.query.ports.findFirst({
		columns: { order: true },
		where: eq(ports.nodeId, port.nodeId),
		orderBy: desc(ports.order),
	});
	const order = lastPort == null ? 0 : lastPort.order + 1;
	const [insertedPort] = await db
		.insert(ports)
		.values({
			nodeId: port.nodeId,
			name: port.name,
			direction: port.direction,
			type: "data",
			order,
		})
		.returning({
			id: ports.id,
		});
	const [nodeBlueprint] = await db
		.select({ nodeId: nodesBlueprints.nodeId, id: nodesBlueprints.id })
		.from(nodesBlueprints)
		.where(
			and(
				eq(nodesBlueprints.blueprintId, blueprintId),
				eq(nodesBlueprints.nodeId, port.nodeId),
			),
		);
	const [portBlueprint] = await db
		.insert(portsBlueprints)
		.values({
			portId: insertedPort.id,
			nodesBlueprintsId: nodeBlueprint.id,
		})
		.returning({ id: portsBlueprints.id });
	await db
		.update(blueprints)
		.set({ dirty: true })
		.where(eq(blueprints.id, blueprintId));
	return {
		port: {
			id: insertedPort.id,
			...port,
			type: "data",
			order,
			portsBlueprintsId: portBlueprint.id,
		},
	};
};
