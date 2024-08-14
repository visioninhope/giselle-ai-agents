"use server";

import {
	db,
	nodesBlueprints,
	ports,
	portsBlueprints,
	requestPortMessages,
	requests,
	steps,
} from "@/drizzle";
import { and, eq } from "drizzle-orm";

type LeaveMessageArgs = {
	requestId: number;
	portId: number;
	message: string;
};
export const leaveMessage = async ({
	requestId,
	portId,
	message,
}: LeaveMessageArgs) => {
	const [result] = await db
		.select({
			portsBlueprintsId: portsBlueprints.id,
		})
		.from(portsBlueprints)
		.innerJoin(
			nodesBlueprints,
			eq(nodesBlueprints.id, portsBlueprints.nodesBlueprintsId),
		)
		.innerJoin(requests, eq(requests.blueprintId, nodesBlueprints.blueprintId))
		.innerJoin(ports, eq(ports.id, portsBlueprints.portId))
		.innerJoin(
			steps,
			and(
				eq(steps.blueprintId, nodesBlueprints.blueprintId),
				eq(steps.nodeId, nodesBlueprints.nodeId),
			),
		)
		.where(and(eq(requests.id, requestId), eq(ports.id, portId)));
	await db.insert(requestPortMessages).values({
		portsBlueprintsId: result.portsBlueprintsId,
		requestId,
		message,
	});
};
