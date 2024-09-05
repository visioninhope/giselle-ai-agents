import {
	builds,
	db,
	nodes,
	ports,
	requestPortMessages,
	requests,
} from "@/drizzle";
import { and, eq } from "drizzle-orm";
import type { Port } from "../../nodes";

type InsertRequestPortMessageArgs = {
	requestDbId: number;
	portId: Port["id"];
	message: string;
};
export const insertRequestPortMessage = async (
	args: InsertRequestPortMessageArgs,
) => {
	const [port] = await db
		.select({ dbId: ports.dbId })
		.from(ports)
		.innerJoin(nodes, eq(nodes.dbId, ports.nodeDbId))
		.innerJoin(builds, eq(builds.dbId, nodes.buildDbId))
		.innerJoin(requests, eq(requests.buildDbId, builds.dbId))
		.where(and(eq(requests.dbId, args.requestDbId), eq(ports.id, args.portId)));
	await db.insert(requestPortMessages).values({
		requestDbId: args.requestDbId,
		portDbId: port.dbId,
		message: args.message,
	});
};
