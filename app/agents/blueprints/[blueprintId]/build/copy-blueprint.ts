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
import { sql } from "drizzle-orm";

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

	await db.execute(
		sql`INSERT INTO ${nodesBlueprintsSchema} (${nodesBlueprintsSchema.nodeId}, ${nodesBlueprintsSchema.blueprintId})})
		    SELECT ${nodesBlueprintsSchema.nodeId}, ${newBlueprint.id}
	      FROM ${nodesBlueprintsSchema}
        WHERE ${nodesBlueprintsSchema.blueprintId} = ${blueprint.id}`,
	);
	await db.execute(
		sql`INSERT INTO ${edgesBlueprintsSchema} (${edgesBlueprintsSchema.edgeId}, ${edgesBlueprintsSchema.blueprintId})})
		SELECT ${edgesBlueprintsSchema.edgeId}, ${newBlueprint.id}
		FROM ${edgesBlueprintsSchema}
		WHERE ${edgesBlueprintsSchema.blueprintId} = ${blueprint.id}`,
	);
};
