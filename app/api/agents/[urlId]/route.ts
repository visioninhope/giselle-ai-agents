import { db, findWorkspaceBySlug } from "@/drizzle/db";
import { NextResponse } from "next/server";
import { getAgent } from "./get-agent";

export const GET = async (
	req: Request,
	{ params }: { params: { urlId: string } },
) => {
	const workspace = await getAgent(params.urlId);

	return NextResponse.json({ workspace });
};
