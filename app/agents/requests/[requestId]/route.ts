// // import { runOnVercel } from "@/services/agents/requests/runners";
// import type { RequestId } from "@/services/agents/requests/types";

// export async function POST(
// 	request: Request,
// 	{ params }: { params: { requestId: RequestId } },
// ) {
// 	await runOnVercel({ requestId: params.requestId });
// 	return new Response(null, { status: 200 });
// }
