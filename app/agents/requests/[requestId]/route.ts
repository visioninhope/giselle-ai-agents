import type { RequestId } from "@/services/agents/requests";
import { runOnVercel } from "@/services/agents/requests/runners";

export async function POST(
	request: Request,
	{ params }: { params: { requestId: RequestId } },
) {
	await runOnVercel({ requestId: params.requestId });
	return new Response(null, { status: 200 });
}
