"use server";

import type { Blueprint } from "@/app/agents/blueprints";
import { blueprints, db, edges, knowledges, nodes, ports } from "@/drizzle";
import { copyKnolwedges } from "@/services/knowledges/actions";
import { eq, inArray } from "drizzle-orm";

/** @todo replace with drizzle syntax if drizzle supports `insert into ... select` [#1605](https://github.com/drizzle-team/drizzle-orm/pull/1605) */
export const copyBlueprint = async (blueprint: Blueprint) => {
	const [newBlueprint] = await db
		.insert(blueprints)
		.values({
			agentId: blueprint.agent.id,
			version: blueprint.version + 1,
		})
		.returning({
			id: blueprints.id,
		});

	const currentNodes = await db.query.nodes.findMany({
		where: eq(nodes.blueprintId, blueprint.id),
	});
	const insertedNodes = await db
		.insert(nodes)
		.values(
			currentNodes.map(({ className, data, position }) => ({
				className,
				data,
				position,
				blueprintId: newBlueprint.id,
			})),
		)
		.returning({ id: nodes.id });
	const nodeMap = new Map(
		currentNodes.map((node, index) => [node.id, insertedNodes[index].id]),
	);
	const currentPorts = await db
		.select()
		.from(ports)
		.where(
			inArray(
				ports.nodeId,
				currentNodes.map(({ id }) => id),
			),
		);
	const insertedPorts = await db
		.insert(ports)
		.values(
			currentPorts
				.map(({ nodeId, direction, type, order, name }) => ({
					direction,
					type,
					order,
					name,
					nodeId: nodeMap.get(nodeId) ?? 0,
				}))
				.filter(({ nodeId }) => nodeId !== 0),
		)
		.returning({ id: ports.id });

	const portMap = new Map(
		currentPorts.map((port, index) => [port.id, insertedPorts[index].id]),
	);
	const currentEdges = await db.query.edges.findMany({
		where: eq(edges.blueprintId, blueprint.id),
	});
	await db.insert(edges).values(
		currentEdges
			.map(({ inputPortId, outputPortId, edgeType }) => ({
				inputPortId: portMap.get(inputPortId) ?? 0,
				outputPortId: portMap.get(outputPortId) ?? 0,
				edgeType,
				blueprintId: newBlueprint.id,
			}))
			.filter(
				({ inputPortId, outputPortId }) =>
					inputPortId !== 0 && outputPortId !== 0,
			),
	);

	await copyKnolwedges(blueprint.id, newBlueprint.id);
};
