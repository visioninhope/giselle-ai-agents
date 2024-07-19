import { type NodeProperties, db, nodesBlueprints } from "@/drizzle";

export type Payload = {
	blueprintId: number;
	nodeId: number;
	properties: NodeProperties;
};
type AssertPayload = (json: unknown) => asserts json is Payload;
/** @todo */
const assertPayload: AssertPayload = (json) => {};

export const PATCH = async (request: Request) => {
	const payload = await request.json();
	assertPayload(payload);
	await db.update(nodesBlueprints).set({
		nodeProperties: payload.properties,
	});
};
