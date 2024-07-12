import {
	blueprints as blueprintsSchema,
	dataRoutes as dataRoutesSchema,
	dataKnots as dataknotsSchema,
	db,
	steps as stepsSchema,
} from "@/drizzle";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getBlueprint } from "../get-blueprint";
import { buildBlueprint } from "./build-blueprint";
import { inferSteps } from "./infer-step";

export const POST = async (
	req: Request,
	{ params }: { params: { urlId: string } },
) => {
	const blueprint = await getBlueprint(params.urlId);
	await buildBlueprint(blueprint);
	return NextResponse.json({ blueprintId: blueprint.id });
};
