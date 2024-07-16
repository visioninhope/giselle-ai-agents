"use server";
import {
	agents as agentsSchema,
	blueprints as blueprintsSchema,
	db,
} from "@/drizzle";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const GET = async (
	_: Request,
	{ params }: { params: { urlId: string } },
) => {
	const [blueprint] = await db
		.select({
			id: blueprintsSchema.id,
			version: blueprintsSchema.version,
			dirty: blueprintsSchema.dirty,
			builded: blueprintsSchema.builded,
			agentId: blueprintsSchema.agentId,
		})
		.from(blueprintsSchema)
		.innerJoin(agentsSchema, eq(agentsSchema.id, blueprintsSchema.agentId))
		.where(eq(agentsSchema.urlId, params.urlId))
		.orderBy(desc(blueprintsSchema.version))
		.limit(1);
	return NextResponse.json({ blueprint });
};
