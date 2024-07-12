import { NextResponse } from "next/server";
import { getBlueprint } from "./get-blueprint";

export const GET = async (
	req: Request,
	{ params }: { params: { urlId: string } },
) => {
	const blueprint = await getBlueprint(params.urlId);

	return NextResponse.json({ blueprint });
};
