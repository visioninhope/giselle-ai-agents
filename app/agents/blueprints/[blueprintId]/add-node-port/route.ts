import {
	db,
	nodes,
	nodesBlueprints,
	portsBlueprints as portsBlueprintsSchema,
	ports as portsSchema,
} from "@/drizzle";
import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import type { BlueprintPort } from "../../blueprint";

export type Payload = {
	port: Pick<typeof portsSchema.$inferInsert, "nodeId" | "name" | "direction">;
};
type AssertPayload = (json: unknown) => asserts json is Payload;
/** @todo Implement this function */
const assertPayload: AssertPayload = (json) => {};
export const POST = async (
	request: Request,
	{ params }: { params: { blueprintId: string } },
) => {
	const json = await request.json();
	assertPayload(json);
	const lastPort = await db.query.ports.findFirst({
		columns: { order: true },
		where: eq(portsSchema.nodeId, json.port.nodeId),
		orderBy: desc(portsSchema.order),
	});
	const order = lastPort == null ? 0 : lastPort.order + 1;
	const [port] = await db
		.insert(portsSchema)
		.values({
			nodeId: json.port.nodeId,
			name: json.port.name,
			direction: json.port.direction,
			type: "data",
			order,
		})
		.returning({
			id: portsSchema.id,
		});
	const [nodeBlueprint] = await db
		.select({ nodeId: nodesBlueprints.nodeId, id: nodesBlueprints.id })
		.from(nodesBlueprints)
		.where(
			and(
				eq(
					nodesBlueprints.blueprintId,
					Number.parseInt(params.blueprintId, 10),
				),
				eq(nodesBlueprints.nodeId, json.port.nodeId),
			),
		);
	await db.insert(portsBlueprintsSchema).values({
		portId: port.id,
		nodesBlueprintsId: nodeBlueprint.id,
	});

	return NextResponse.json<{
		port: BlueprintPort;
	}>({
		port: {
			id: port.id,
			nodeId: json.port.nodeId,
			name: json.port.name,
			direction: json.port.direction,
			type: "data",
			order,
		},
	});
};
