import {
	blueprints,
	db,
	nodes,
	ports,
	requestPortMessages,
	requests,
} from "@/drizzle";
import { and, eq } from "drizzle-orm";
import type { Port } from "../nodes";

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
		.innerJoin(blueprints, eq(blueprints.dbId, nodes.blueprintDbId))
		.innerJoin(requests, eq(requests.blueprintDbId, blueprints.dbId))
		.where(and(eq(requests.dbId, args.requestDbId), eq(ports.id, args.portId)));
	await db.insert(requestPortMessages).values({
		requestDbId: args.requestDbId,
		portDbId: port.dbId,
		message: args.message,
	});
};
