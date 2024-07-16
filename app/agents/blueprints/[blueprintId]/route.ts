"use server";

import type { Blueprint } from "@/app/agents/blueprints";
import { NextResponse } from "next/server";
import { getBlueprint } from "./lib/get-blueprint";

export const GET = async (
	_req: Request,
	{ params }: { params: { blueprintId: string } },
) => {
	const blueprint = await getBlueprint(Number.parseInt(params.blueprintId, 10));
	return NextResponse.json<{ blueprint: Blueprint }>({
		blueprint,
	});
};
