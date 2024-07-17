import { db, ports as portsSchema } from "@/drizzle";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import type { BlueprintPort } from "../../blueprint";

export type Payload = {
	port: Pick<typeof portsSchema.$inferInsert, "nodeId" | "name" | "direction">;
};
type AssertPayload = (json: unknown) => asserts json is Payload;
/** @todo Implement this function */
const assertPayload: AssertPayload = (json) => {};
export const POST = async (request: Request) => {
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
