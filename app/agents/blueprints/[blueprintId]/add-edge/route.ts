"use server";
import type { Edge } from "@/app/agents/blueprints";
import {
	blueprints as blueprintsSchema,
	db,
	edgesBlueprints as edgesBlueprintsSchema,
	edges as edgesSchema,
	ports as portsSchema,
} from "@/drizzle";
import { eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import invariant from "tiny-invariant";

export type Payload = {
	edge: {
		originPortId: number;
		destinationPortId: number;
	};
};

type AssertPayload = (json: unknown) => asserts json is Payload;
const assertPayload: AssertPayload = () => {};
export const POST = async (
	request: Request,
	{ params }: { params: { blueprintId: string } },
) => {
	const json = await request.json();
	assertPayload(json);

	const blueprint = await db.query.blueprints.findFirst({
		where: eq(blueprintsSchema.id, Number.parseInt(params.blueprintId, 10)),
	});
	invariant(blueprint != null, `Blueprint not found: ${params.blueprintId}`);
	const inputPort = await db.query.ports.findFirst({
		where: eq(portsSchema.id, json.edge.destinationPortId),
	});
	const outputPort = await db.query.ports.findFirst({
		where: eq(portsSchema.id, json.edge.originPortId),
	});
	invariant(
		inputPort != null,
		`No input port found with id ${json.edge.destinationPortId}`,
	);
	invariant(
		outputPort != null,
		`No output port found with id ${json.edge.originPortId}`,
	);
	const [edge] = await db
		.insert(edgesSchema)
		.values({
			agentId: blueprint.agentId,
			inputPortId: inputPort.id,
			outputPortId: outputPort.id,
			edgeType: outputPort.type,
		})
		.returning({
			id: edgesSchema.id,
		});
	await db.insert(edgesBlueprintsSchema).values({
		edgeId: edge.id,
		blueprintId: blueprint.id,
	});
	return NextResponse.json<{ edge: Edge }>({
		edge: {
			id: edge.id,
			edgeType: outputPort.type,
			inputPort,
			outputPort,
		},
	});
};
