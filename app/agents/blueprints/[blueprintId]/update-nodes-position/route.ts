import { db, nodes as nodesSchema } from "@/drizzle";
import { eq } from "drizzle-orm";

export type Payload = {
	nodes: Array<{ id: number; position: { x: number; y: number } }>;
};
type AssertPayload = (payload: unknown) => asserts payload is Payload;
const assertPayload: AssertPayload = (payload) => {};
export const PATCH = async (request: Request) => {
	const payload = await request.json();
	assertPayload(payload);
	for (const node of payload.nodes) {
		await db
			.update(nodesSchema)
			.set({
				position: node.position,
			})
			.where(eq(nodesSchema.id, node.id));
	}
	return new Response(null, { status: 204 });
};
