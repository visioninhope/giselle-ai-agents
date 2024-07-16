import { blueprints as blueprintsSchema, db } from "@/drizzle";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import invariant from "tiny-invariant";
import { getBlueprint } from "../lib/get-blueprint";
import { buildBlueprint } from "./build-blueprint";
import { copyBlueprint } from "./copy-blueprint";

export const POST = async (
	_req: Request,
	{ params }: { params: { blueprintId: string } },
) => {
	const blueprint = await getBlueprint(Number.parseInt(params.blueprintId, 10));
	if (blueprint.dirty) {
		if (!blueprint.builded) {
			await buildBlueprint(blueprint);
			await copyBlueprint(blueprint);
		}
		return NextResponse.json({ blueprintId: blueprint.id });
	}

	const previousBlueprint = await db.query.blueprints.findFirst({
		where: and(
			eq(blueprintsSchema.agentId, blueprint.agent.id),
			eq(blueprintsSchema.version, blueprint.version - 1),
		),
	});
	invariant(previousBlueprint != null, "Previous blueprint not found");
	return NextResponse.json({ blueprintId: previousBlueprint.id });
};
