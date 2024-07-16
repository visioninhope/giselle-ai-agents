"use server";

import { type Blueprint, getBlueprint } from "@/app/agents/blueprints";
import { NextResponse } from "next/server";

export const GET = async (
	_req: Request,
	{ params }: { params: { blueprintId: string } },
) => {
	const blueprint = await getBlueprint(Number.parseInt(params.blueprintId, 10));
	return NextResponse.json<{ blueprint: Blueprint }>({
		blueprint,
	});
};
