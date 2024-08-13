"use server";

import type { Node } from "@/app/agents/blueprints";
import {
	NodeClassCategory,
	type NodeClassName,
	getNodeClass,
} from "@/app/nodes";
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
	const nodeClass = getNodeClass({ name: args.node.className });
	invariant(nodeClass != null, `Node class not found: ${args.node.className}`);
	if (nodeClass.name == null) {
		throw new Error("Node class name is required");
	}
	const [insertedNode] = await db
		.insert(nodes)
		.values({
			agentId: blueprint.agentId,
			className: args.node.className,
			position: args.node.position,
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
			nodeProperties: nodeClass.template.properties ?? [],
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
			properties: nodeClass.template.properties ?? [],
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
