"use server";
import { db } from "@/drizzle/db";
import * as schema from "@/drizzle/schema";
import { eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import invariant from "tiny-invariant";
import {
	type Edge,
	getAgentWithLatestBlueprint,
} from "../../_helpers/get-blueprint";

export type PostPayload = {
	originPortId: number;
	destinationPortId: number;
};

type AssertPostPayload = (json: unknown) => asserts json is PostPayload;
/**
 * @todo Implement this function
 */
const assertPostPayload: AssertPostPayload = () => {};
export const POST = async (
	request: Request,
	{ params }: { params: { urlId: string } },
) => {
	const json = await request.json();
	assertPostPayload(json);
	const agent = await getAgentWithLatestBlueprint(params.urlId);

	const inputPort = await db.query.ports.findFirst({
		where: eq(schema.ports.id, json.destinationPortId),
	});
	const outputPort = await db.query.ports.findFirst({
		where: eq(schema.ports.id, json.originPortId),
	});
	invariant(
		inputPort != null,
		`No input port found with id ${json.destinationPortId}`,
	);
	invariant(
		outputPort != null,
		`No output port found with id ${json.originPortId}`,
	);
	const [insertedEdge] = await db
		.insert(schema.edges)
		.values({
			blueprintId: agent.latestBlueprint.id,
			inputPortId: inputPort.id,
			outputPortId: outputPort.id,
			edgeType: outputPort.type,
		})
		.returning({
			insertedId: schema.edges.id,
		});
	const edge: Edge = {
		id: insertedEdge.insertedId,
		edgeType: outputPort.type,
		inputPort,
		outputPort,
	};
	return NextResponse.json({ edge });
};

type DeletePayload = {
	deleteEdgeIds: number[];
};

type AssertDeletePayload = (json: unknown) => asserts json is DeletePayload;
/**
 * @todo Implement this function
 */
const assertDeletePayload: AssertDeletePayload = () => {};
export const DELETE = async (request: Request) => {
	const json = await request.json();
	assertDeletePayload(json);
	const deletedEdges = await db
		.delete(schema.edges)
		.where(inArray(schema.edges.id, json.deleteEdgeIds))
		.returning({
			deletedId: schema.edges.id,
		});
	return NextResponse.json({
		deletedEdgeIds: deletedEdges.map((edge) => edge.deletedId),
	});
};
