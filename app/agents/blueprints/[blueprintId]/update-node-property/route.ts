import { db, nodesBlueprints } from "@/drizzle";
import { and, eq } from "drizzle-orm";

export type Payload = {
	blueprintId: number;
	nodeId: number;
	property: {
		name: string;
		value: string;
	};
};
type AssertPayload = (json: unknown) => asserts json is Payload;
/** @todo */
const assertPayload: AssertPayload = (json) => {};

export const PATCH = async (request: Request) => {
	const payload = await request.json();
	assertPayload(payload);
	const [nodeBlueprint] = await db
		.select()
		.from(nodesBlueprints)
		.where(
			and(
				eq(nodesBlueprints.nodeId, payload.nodeId),
				eq(nodesBlueprints.blueprintId, payload.blueprintId),
			),
		);
	await db
		.update(nodesBlueprints)
		.set({
			nodeProperties: nodeBlueprint.nodeProperties.map((property) => {
				if (property.name !== payload.property.name) {
					return property;
				}
				return {
					...property,
					value: payload.property.value,
				};
			}),
		})
		.where(eq(nodesBlueprints.id, nodeBlueprint.id));
	return new Response(null, { status: 204 });
};
