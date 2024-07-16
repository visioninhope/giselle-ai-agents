"use server";
import {
	db,
	edgesBlueprints as edgesBlueprintsSchema,
	edges as edgesSchema,
} from "@/drizzle";
import { and, eq, inArray } from "drizzle-orm";

export type Payload = {
	deleteEdgeIds: number[];
};

type AssertDeletePayload = (json: unknown) => asserts json is Payload;
/**
 * @todo Implement this function
 */
const assertDeletePayload: AssertDeletePayload = () => {};
export const DELETE = async (
	request: Request,
	{ params }: { params: { blueprintId: string } },
) => {
	const json = await request.json();
	assertDeletePayload(json);
	await db
		.delete(edgesBlueprintsSchema)
		.where(
			and(
				eq(
					edgesBlueprintsSchema.blueprintId,
					Number.parseInt(params.blueprintId, 10),
				),
				inArray(edgesBlueprintsSchema.edgeId, json.deleteEdgeIds),
			),
		)
		.returning({
			deletedId: edgesSchema.id,
		});

	return new Response(null, { status: 204 });
};
