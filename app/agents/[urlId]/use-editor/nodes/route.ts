import { type NodeType, getNodeDef } from "@/app/node-defs";
import { db } from "@/drizzle/db";
import * as schema from "@/drizzle/schema";
import { NextResponse } from "next/server";
import {
	type Node,
	getAgentWithLatestBlueprint,
} from "../../_helpers/get-blueprint";

type PostPayload = {
	node: {
		type: NodeType;
		position: { x: number; y: number };
	};
};

type AssertPostPayload = (json: unknown) => asserts json is PostPayload;
/**
 * @todo Implement this function
 */
const assertPostPayload: AssertPostPayload = (json) => {};

export const POST = async (
	request: Request,
	{ params }: { params: { urlId: string } },
) => {
	const json = await request.json();
	assertPostPayload(json);
	const nodeDef = getNodeDef(json.node.type);
	const agent = await getAgentWithLatestBlueprint(params.urlId);
	const [node] = await db
		.insert(schema.nodes)
		.values({
			blueprintId: agent.latestBlueprint.id,
			type: nodeDef.key,
			position: json.node.position,
		})
		.returning({
			insertedId: schema.nodes.id,
		});
	const inputPorts: (typeof schema.ports.$inferInsert)[] = (
		nodeDef.inputPorts ?? []
	).map((port, index) => ({
		nodeId: node.insertedId,
		type: port.type,
		direction: "input",
		order: index,
		name: port.label ?? "",
	}));
	const outputPorts: (typeof schema.ports.$inferInsert)[] = (
		nodeDef.outputPorts ?? []
	).map((port, index) => ({
		nodeId: node.insertedId,
		type: port.type,
		direction: "output",
		order: index,
		name: port.label ?? "",
	}));
	const ports = await db
		.insert(schema.ports)
		.values([...inputPorts, ...outputPorts])
		.returning({
			insertedId: schema.ports.id,
		});
	const returnNode: Node = {
		id: node.insertedId,
		position: json.node.position,
		type: json.node.type,
		inputPorts: inputPorts.map((port, index) => ({
			...port,
			id: ports[index].insertedId,
		})),
		outputPorts: outputPorts.map((port, index) => ({
			...port,
			id: ports[index].insertedId,
		})),
	};
	return NextResponse.json({
		node: returnNode,
	});
};

type DeletePayload = {
	deletedNodeIds: number[];
};

// biome-ignore lint/suspicious/noExplicitAny:
const ensureDeletePayload = (payload: any): DeletePayload => {
	if (!Array.isArray(payload.deletedNodeIds)) {
		throw new Error("Invalid payload: deletedNodeIds must be an array");
	}
	if (!payload.deletedNodeIds.every((id: unknown) => typeof id === "number")) {
		throw new Error("Invalid payload: all deletedNodeIds must be numbers");
	}
	return payload;
};
export const DELETE = async (
	request: Request,
	{ params }: { params: { slug: string } },
) => {
	const json = await request.json();
	const payload = ensureDeletePayload(json);
};
