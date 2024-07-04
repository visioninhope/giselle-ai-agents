import { db, findWorkspaceBySlug } from "@/drizzle/db";
import { NextResponse } from "next/server";

export const GET = async (
	req: Request,
	{ params }: { params: { slug: string } },
) => {
	const workspace = await findWorkspaceBySlug(params.slug);

	return NextResponse.json({ workspace });
};
