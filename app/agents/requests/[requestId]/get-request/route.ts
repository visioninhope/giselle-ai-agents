import { NextResponse } from "next/server";
import { getRequest } from "./get-request";

export const GET = async (
	req: Request,
	{ params }: { params: { requestId: string } },
) => {
	const request = await getRequest(Number.parseInt(params.requestId));

	return NextResponse.json({ request });
};
