import { db, nodesBlueprints as nodesBlueprintsSchema } from "@/drizzle";
import { and, eq, inArray } from "drizzle-orm";

export type Payload = {
	deleteNodeIds: number[];
};

type AssertDeletePayload = (json: unknown) => asserts json is Payload;
/**
 * @todo Implement this function
 */
const assertDeletePayload: AssertDeletePayload = (json) => {};

export const DELETE = async (
	request: Request,
	{ params }: { params: { blueprintId: string } },
) => {
	const json = await request.json();
	assertDeletePayload(json);
	await db
		.delete(nodesBlueprintsSchema)
		.where(
			and(
				eq(
					nodesBlueprintsSchema.blueprintId,
					Number.parseInt(params.blueprintId, 10),
				),
				inArray(nodesBlueprintsSchema.nodeId, json.deleteNodeIds),
			),
		);
	return new Response(null, { status: 204 });
};
