import { getRequest } from "@/app/agents/requests";
import { NextResponse } from "next/server";

export const GET = async (
	req: Request,
	{ params }: { params: { requestId: string } },
) => {
	const request = await getRequest(Number.parseInt(params.requestId));

	return NextResponse.json({ request });
};
