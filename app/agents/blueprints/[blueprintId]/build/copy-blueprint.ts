import type { Blueprint } from "@/app/agents/blueprints";
import {
	blueprints,
	db,
	edges,
	edgesBlueprints as edgesBlueprintsSchema,
	nodes,
	nodesBlueprints as nodesBlueprintsSchema,
	ports,
} from "@/drizzle";
import { eq, sql } from "drizzle-orm";

/** @todo replace with drizzle syntax if drizzle supports `insert into ... select` [#1605](https://github.com/drizzle-team/drizzle-orm/pull/1605) */
export const copyBlueprint = async (blueprint: Blueprint) => {
	console.log("a");
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
		},
		where: eq(nodesBlueprintsSchema.blueprintId, blueprint.id),
	});
	await db.insert(nodesBlueprintsSchema).values(
		originNodeBlueprints.map(({ nodeId }) => ({
			nodeId,
			blueprintId: newBlueprint.id,
		})),
	);
	const originEdgeBlueprints = await db.query.edgesBlueprints.findMany({
		columns: {
			edgeId: true,
		},
		where: eq(edgesBlueprintsSchema.blueprintId, blueprint.id),
	});
	await db.insert(edgesBlueprintsSchema).values(
		originEdgeBlueprints.map(({ edgeId }) => ({
			edgeId,
			blueprintId: newBlueprint.id,
		})),
	);
};
