import type { RequestId } from "@/services/agents/requests";

export async function POST(
	request: Request,
	{ params }: { params: { requestId: RequestId } },
) {}
