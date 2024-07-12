import { NextResponse } from "next/server";
import { getAgentRequest } from "../get-agent-request";

export const GET = async (
	req: Request,
	{ params }: { params: { requestId: string } },
) => {
	const agentRequest = await getAgentRequest(Number.parseInt(params.requestId));

	return NextResponse.json(agentRequest);
};
