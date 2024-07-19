import {
	db,
	nodesBlueprints,
	portsBlueprints,
	ports as portsSchema,
} from "@/drizzle";
import { and, eq } from "drizzle-orm";

export type Payload = {
	port: {
		id: number;
	};
};
type AssertPayload = (json: unknown) => asserts json is Payload;
/** @todo */
const assertPayload: AssertPayload = (json) => {};
export const DELETE = async (
	request: Request,
	{ params }: { params: { blueprintId: string } },
) => {
	const payload = await request.json();
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
				eq(portsBlueprints.portId, payload.port.id),
				eq(
					nodesBlueprints.blueprintId,
					Number.parseInt(params.blueprintId, 10),
				),
			),
		);
	assertPayload(payload);
	await db
		.delete(portsBlueprints)
		.where(
			and(
				eq(portsBlueprints.portId, payload.port.id),
				eq(portsBlueprints.nodesBlueprintsId, relation.nodesBlueprintsId),
			),
		);
	return new Response(null, { status: 202 });
};
