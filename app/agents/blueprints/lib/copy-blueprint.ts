"use server";

import type { Blueprint } from "@/app/agents/blueprints";
import {
	blueprints,
	db,
	edges,
	edgesBlueprints,
	nodes,
	nodesBlueprints,
	ports,
	portsBlueprints,
} from "@/drizzle";
import { and, eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

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

	const originNodeBlueprints = await db.query.nodesBlueprints.findMany({
		columns: {
			nodeId: true,
			nodeProperties: true,
		},
		where: eq(nodesBlueprints.blueprintId, blueprint.id),
	});
	await db.insert(nodesBlueprints).values(
		originNodeBlueprints.map(({ nodeId, nodeProperties }) => ({
			nodeId,
			nodeProperties,
			blueprintId: newBlueprint.id,
		})),
	);
	const originEdgeBlueprints = await db.query.edgesBlueprints.findMany({
		columns: {
			edgeId: true,
		},
		where: eq(edgesBlueprints.blueprintId, blueprint.id),
	});
	await db.insert(edgesBlueprints).values(
		originEdgeBlueprints.map(({ edgeId }) => ({
			edgeId,
			blueprintId: newBlueprint.id,
		})),
	);
	const newNodesBlueprints = alias(nodesBlueprints, "newNodesBlueprints");
	const originPortsBlueprints = await db
		.select({
			portId: portsBlueprints.portId,
			blueprintId: nodesBlueprints.blueprintId,
			newNodesBlueprintsId: newNodesBlueprints.id,
		})
		.from(portsBlueprints)
		.innerJoin(
			nodesBlueprints,
			and(
				eq(nodesBlueprints.id, portsBlueprints.nodesBlueprintsId),
				eq(nodesBlueprints.blueprintId, blueprint.id),
			),
		)
		.innerJoin(
			newNodesBlueprints,
			and(
				eq(newNodesBlueprints.nodeId, nodesBlueprints.nodeId),
				eq(newNodesBlueprints.blueprintId, newBlueprint.id),
			),
		)
		.where(eq(nodesBlueprints.blueprintId, blueprint.id));
	await db.insert(portsBlueprints).values(
		originPortsBlueprints.map(({ portId, newNodesBlueprintsId }) => ({
			portId,
			nodesBlueprintsId: newNodesBlueprintsId,
		})),
	);
};
