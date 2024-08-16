"use server";

import { db, nodes, ports, pullMessages, requestResults } from "@/drizzle";
import { and, eq } from "drizzle-orm";

type InsertRequestResultArgs = {
	requestId: number;
	nodeId: number;
};

export const insertRequestResult = async ({
	requestId,
	nodeId,
}: InsertRequestResultArgs) => {
	const [outputPort] = await db
		.select({ id: ports.id, name: ports.name })
		.from(ports)
		.innerJoin(nodes, eq(ports.nodeId, nodes.id))
		.where(and(eq(nodes.id, nodeId), eq(ports.name, "output")));
	const [outputMessage] = await db
		.with(pullMessages)
		.select()
		.from(pullMessages)
		.where(
			and(
				eq(pullMessages.requestId, requestId),
				eq(pullMessages.nodeId, nodeId),
				eq(pullMessages.portId, outputPort.id),
			),
		);
	await db.insert(requestResults).values({
		requestId,
		text: outputMessage.content,
	});
};
