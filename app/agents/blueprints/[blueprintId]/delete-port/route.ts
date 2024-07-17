import { db, ports as portsSchema } from "@/drizzle";
import { eq } from "drizzle-orm";

export type Payload = {
	port: {
		id: number;
	};
};
type AssertPayload = (json: unknown) => asserts json is Payload;
/** @todo */
const assertPayload: AssertPayload = (json) => {};
export const DELETE = async (request: Request) => {
	const payload = await request.json();
	assertPayload(payload);
	await db.delete(portsSchema).where(eq(portsSchema.id, payload.port.id));
	return new Response(null, { status: 202 });
};
