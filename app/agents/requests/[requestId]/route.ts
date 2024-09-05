import type { RequestId } from "@/services/agents/requests";
import { runOnVercel } from "@/services/agents/requests/runners";
import { getUserSubscriptionId } from "@/app/(auth)/lib";
import { metrics } from "@opentelemetry/api";

export async function POST(
	request: Request,
	{ params }: { params: { requestId: RequestId } },
) {
        const meter = metrics.getMeter("agent");
        const requestCounter = meter.createCounter("agent_request", {
                description: "Number of Agent requests",
        });

        requestCounter.add(1, {
                subscriptionId: await getUserSubscriptionId(),
        });
	await runOnVercel({ requestId: params.requestId });
	return new Response(null, { status: 200 });
}
