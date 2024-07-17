import { db, ports as portsSchema } from "@/drizzle";
import { desc, eq } from "drizzle-orm";

export type Payload = {
	port: {
		id: number;
		name: string;
	};
};

type AssertPayload = (json: unknown) => asserts json is Payload;
/** @todo */
const assertPayload: AssertPayload = (json) => {};
export const PATCH = async (request: Request) => {
	const payload = await request.json();
	assertPayload(payload);
	await db
		.update(portsSchema)
		.set({
			name: payload.port.name,
		})
		.where(eq(portsSchema.id, payload.port.id));
	return new Response(null, { status: 201 });
};
