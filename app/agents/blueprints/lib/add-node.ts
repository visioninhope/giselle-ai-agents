"use server";

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
export const addNode = async (args: AddNodeArgs) => {
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
	await db
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
};
