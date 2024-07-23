"use server";

import type { Node } from "@/app/agents/blueprints";
import { type NodeClassName, getNodeClass } from "@/app/node-classes";
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
	node: {
		className: NodeClassName;
		position: { x: number; y: number };
	};
};
export const addNode = async (args: AddNodeArgs): Promise<Node> => {
	const blueprint = await db.query.blueprints.findFirst({
		where: eq(blueprints.id, args.blueprintId),
	});
	invariant(blueprint != null, `Blueprint not found: ${args.blueprintId}`);
	const nodeClass = getNodeClass(args.node.className);
	const [node] = await db
		.insert(nodes)
		.values({
			agentId: blueprint.agentId,
			className: nodeClass.name,
			position: args.node.position,
		})
		.returning({
			id: nodes.id,
		});
	const inputPorts: (typeof ports.$inferInsert)[] = (
		nodeClass.inputPorts ?? []
	).map((port, index) => ({
		nodeId: node.id,
		type: port.type,
		direction: "input",
		order: index,
		name: port.label ?? "",
		nodeClassKey: port.key,
	}));
	const outputPorts: (typeof ports.$inferInsert)[] = (
		nodeClass.outputPorts ?? []
	).map((port, index) => ({
		nodeId: node.id,
		type: port.type,
		direction: "output",
		order: index,
		name: port.label ?? "",
		nodeClassKey: port.key,
	}));
	const insertedPorts = await db
		.insert(ports)
		.values([...inputPorts, ...outputPorts])
		.returning({
			id: ports.id,
		});
	const [nodeBlueprint] = await db
		.insert(nodesBlueprints)
		.values({
			nodeId: node.id,
			blueprintId: blueprint.id,
			nodeProperties: nodeClass.properties ?? [],
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
		id: node.id,
		position: args.node.position,
		className: args.node.className,
		properties: nodeClass.properties ?? [],
		inputPorts: inputPorts.map((port, index) => ({
			...port,
			id: insertedPorts[index].id,
			portsBlueprintsId: insertedPortsBlueprints[index].id,
			nodeClassKey: port.nodeClassKey ?? null,
		})),
		outputPorts: outputPorts.map((port, index) => ({
			...port,
			id: insertedPorts[index + inputPorts.length].id,
			portsBlueprintsId: insertedPortsBlueprints[index + inputPorts.length].id,
			nodeClassKey: port.nodeClassKey ?? null,
		})),
		propertyPortMap: nodeClass.propertyPortMap ?? {},
	};
};
