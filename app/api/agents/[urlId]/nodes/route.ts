import * as nodeDefs from "@/app/api/nodeDefs";
import type { NodeType } from "@/app/api/nodeDefs";
import {
	type NodeWithPort,
	db,
	getWorkspaceWithLatestWorkspaceHistory,
} from "@/drizzle/db";
import { agents, nodes, ports as portsSchema } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import invariant from "tiny-invariant";

type PostPayload = {
	node: {
		type: NodeType;
		position: {
			x: number;
			y: number;
		};
	};
};

// biome-ignore lint: lint/suspicious/noExplicitAny
const ensurePostPayload = (payload: any): PostPayload => {
	if (typeof payload.node !== "object" || payload.node === null) {
		throw new Error("Invalid payload: node must be an object");
	}
	if (typeof payload.node.type !== "string") {
		throw new Error("Invalid payload: node.type must be a string");
	}
	if (
		typeof payload.node.position !== "object" ||
		payload.node.position === null
	) {
		throw new Error("Invalid payload: node.position must be an object");
	}
	if (
		typeof payload.node.position.x !== "number" ||
		typeof payload.node.position.y !== "number"
	) {
		throw new Error(
			"Invalid payload: node.position.x and node.position.y must be numbers",
		);
	}
	return payload;
};
export const POST = async (
	request: Request,
	{ params }: { params: { urlId: string } },
) => {
	const json = await request.json();
	const payload = ensurePostPayload(json);
	const nodeDef = nodeDefs.getNodeDef(payload.node.type);
	const workspace = await getWorkspaceWithLatestWorkspaceHistory(params.urlId);
	const [node] = await db
		.insert(nodes)
		.values({
			workspaceHistoryId: workspace.latestWorkspaceHistory.id,
			type: nodeDef.key,
			position: payload.node.position,
		})
		.returning({
			insertedId: nodes.id,
		});
	const inputPorts: (typeof portsSchema.$inferInsert)[] = (
		nodeDef.inputPorts ?? []
	).map((port, index) => ({
		nodeId: node.insertedId,
		type: port.type,
		direction: "input",
		order: index,
		name: port.label ?? "",
	}));
	const outputPorts: (typeof portsSchema.$inferInsert)[] = (
		nodeDef.outputPorts ?? []
	).map((port, index) => ({
		nodeId: node.insertedId,
		type: port.type,
		direction: "output",
		order: index,
		name: port.label ?? "",
	}));
	const ports = await db
		.insert(portsSchema)
		.values([...inputPorts, ...outputPorts])
		.returning({
			insertedId: portsSchema.id,
		});
	const returnNode: NodeWithPort = {
		id: node.insertedId,
		position: payload.node.position,
		type: payload.node.type,
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
