"use server";

import type { Node } from "@/app/agents/blueprints";
import { assertNodeClassName, nodeService } from "@/app/nodes";
import { blueprints, db, nodes, ports } from "@/drizzle";
import { and, eq } from "drizzle-orm";
import invariant from "tiny-invariant";

type AddNodeArgs = {
	blueprintId: number;
	node: Node;
};

export const addNode = async (args: AddNodeArgs): Promise<{ node: Node }> => {
	assertNodeClassName(args.node.className);
	const blueprint = await db.query.blueprints.findFirst({
		where: eq(blueprints.id, args.blueprintId),
	});
	invariant(blueprint != null, `Blueprint not found: ${args.blueprintId}`);
	const [insertedNode] = await db
		.insert(nodes)
		.values({
			blueprintId: args.blueprintId,
			className: args.node.className,
			data: args.node.data,
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
	await db
		.update(blueprints)
		.set({ dirty: true })
		.where(eq(blueprints.id, args.blueprintId));
	const node: Node = {
		id: insertedNode.id,
		position: args.node.position,
		className: args.node.className,
		data: args.node.data,
		inputPorts: args.node.inputPorts.map((port, index) => ({
			...port,
			id: insertedPorts[index].id,
			nodeId: insertedNode.id,
		})),
		outputPorts: args.node.outputPorts.map((port, index) => ({
			...port,
			id: insertedPorts[index + args.node.inputPorts.length].id,
			nodeId: insertedNode.id,
		})),
	};

	await nodeService.runAfterCreateCallback(args.node.className, { node });

	return { node };
};
