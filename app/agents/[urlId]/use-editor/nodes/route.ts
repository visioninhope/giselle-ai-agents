import type { Node } from "@/app/agents/blueprints";
import { type NodeType, getNodeDef } from "@/app/node-defs";
import { db } from "@/drizzle/db";
import * as schema from "@/drizzle/schema";
import { eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getAgentWithLatestBlueprint } from "../../blueprints";

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
	await db
		.update(schema.blueprints)
		.set({ dirty: true })
		.where(eq(schema.blueprints.id, agent.latestBlueprint.id));
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
	deleteNodeIds: number[];
};

type AssertDeletePayload = (json: unknown) => asserts json is DeletePayload;
/**
 * @todo Implement this function
 */
const assertDeletePayload: AssertDeletePayload = (json) => {};

export const DELETE = async (request: Request) => {
	const json = await request.json();
	assertDeletePayload(json);
	const deletedNodeIds = await db
		.delete(schema.nodes)
		.where(inArray(schema.nodes.id, json.deleteNodeIds))
		.returning({
			deletedNodeId: schema.nodes.id,
		});
	return NextResponse.json({
		deletedNodeIds: deletedNodeIds.map((node) => node.deletedNodeId),
	});
};
