"use server";

import type { Node } from "@/app/agents/blueprints";
import {
	blueprints,
	db,
	nodes,
	nodesBlueprints,
	ports,
	portsBlueprints,
} from "@/drizzle";
import { eq } from "drizzle-orm";
import invariant from "tiny-invariant";

type AddNodeArgs = {
	blueprintId: number;
	node: Node;
};

export const addNode = async (args: AddNodeArgs): Promise<{ node: Node }> => {
	const blueprint = await db.query.blueprints.findFirst({
		where: eq(blueprints.id, args.blueprintId),
	});
	invariant(blueprint != null, `Blueprint not found: ${args.blueprintId}`);
	const [insertedNode] = await db
		.insert(nodes)
		.values({
			agentId: blueprint.agentId,
			className: args.node.className,
		})
		.returning({
			id: nodes.id,
		});
	const insertedPorts = await db
		.insert(ports)
		.values(
			[...args.node.inputPorts, ...args.node.outputPorts].map(
				({ type, direction, order, name }) => ({
					nodeId: insertedNode.id,
					type,
					direction,
					order,
					name,
				}),
			),
		)
		.returning({
			id: ports.id,
		});
	const [nodeBlueprint] = await db
		.insert(nodesBlueprints)
		.values({
			nodeId: insertedNode.id,
			blueprintId: blueprint.id,
			data: args.node.data,
			position: args.node.position,
		})
		.returning({ id: nodesBlueprints.id });
	const insertedPortsBlueprints = await db
		.insert(portsBlueprints)
		.values(
			insertedPorts.map(({ id }) => ({
				portId: id,
				nodesBlueprintsId: nodeBlueprint.id,
			})),
		)
		.returning({ id: portsBlueprints.id });
	await db
		.update(blueprints)
		.set({ dirty: true })
		.where(eq(blueprints.id, args.blueprintId));
	return {
		node: {
			id: insertedNode.id,
			position: args.node.position,
			className: args.node.className,
			data: args.node.data,
			inputPorts: args.node.inputPorts.map((port, index) => ({
				...port,
				id: insertedPorts[index].id,
				nodeId: insertedNode.id,
				portsBlueprintsId: insertedPortsBlueprints[index].id,
			})),
			outputPorts: args.node.outputPorts.map((port, index) => ({
				...port,
				id: insertedPorts[index + args.node.inputPorts.length].id,
				nodeId: insertedNode.id,
				portsBlueprintsId:
					insertedPortsBlueprints[index + args.node.inputPorts.length].id,
			})),
		},
	};
};
