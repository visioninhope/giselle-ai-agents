"use server";

import { blueprints, db, nodes, ports } from "@/drizzle";
import { and, desc, eq } from "drizzle-orm";
import type { BlueprintPort } from "../blueprint";

type AddNodePortArgs = {
	blueprintId: number;
	port: Pick<typeof ports.$inferInsert, "nodeId" | "name" | "direction">;
};

export const addNodePort = async (
	args: AddNodePortArgs,
): Promise<{ port: BlueprintPort }> => {
	const lastPort = await db.query.ports.findFirst({
		columns: { order: true },
		where: eq(ports.nodeId, args.port.nodeId),
		orderBy: desc(ports.order),
	});
	const order = lastPort == null ? 0 : lastPort.order + 1;
	const [insertedPort] = await db
		.insert(ports)
		.values({
			nodeId: args.port.nodeId,
			name: args.port.name,
			direction: args.port.direction,
			type: "data",
			order,
		})
		.returning({
			id: ports.id,
		});
	await db
		.update(blueprints)
		.set({ dirty: true })
		.where(eq(blueprints.id, args.blueprintId));
	return {
		port: {
			id: insertedPort.id,
			...args.port,
			type: "data",
			order,
		},
	};
};
