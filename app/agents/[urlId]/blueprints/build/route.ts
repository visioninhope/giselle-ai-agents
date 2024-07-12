import { blueprints, db } from "@/drizzle";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import invariant from "tiny-invariant";
import { getBlueprint } from "../get-blueprint";
import { buildBlueprint } from "./build-blueprint";
import { copyBlueprint } from "./copy-blueprint";

export const POST = async (
	req: Request,
	{ params }: { params: { urlId: string } },
) => {
	const blueprint = await getBlueprint(params.urlId);
	if (blueprint.dirty) {
		if (!blueprint.builded) {
			await buildBlueprint(blueprint);
			await copyBlueprint(blueprint);
		}
		return NextResponse.json({ blueprintId: blueprint.id });
	}
	const previousBlueprint = await db.query.blueprints.findFirst({
		where: and(
			eq(blueprints.agentId, blueprint.agent.id),
			eq(blueprints.version, blueprint.version - 1),
		),
	});
	invariant(previousBlueprint != null, "Previous blueprint not found");
	return NextResponse.json({ blueprintId: previousBlueprint.id });
};
