import { Webhooks } from "@octokit/webhooks";
import type { WebhookEventName } from "@octokit/webhooks-types";
import type { NextRequest } from "next/server";
import { WebhookPayloadError, handleEvent } from "./handle_event";

// Extend the max duration of the server actions from this page to 5 minutes
// https://vercel.com/docs/functions/runtimes#max-duration
export const maxDuration = 300;

export async function POST(request: NextRequest) {
	if (process.env.GITHUB_APP_WEBHOOK_SECRET === undefined) {
		throw new Error("GITHUB_APP_WEBHOOK_SECRET is not set");
	}
	const webhooks = new Webhooks({
		secret: process.env.GITHUB_APP_WEBHOOK_SECRET,
	});

	const signature = request.headers.get("X-Hub-Signature-256") ?? "";
	const body = await request.text();
	const verifyOK = await webhooks.verify(body, signature);
	if (!verifyOK) {
		return new Response("Failed to verify webhook", { status: 400 });
	}

	const id = request.headers.get("X-GitHub-Delivery") ?? "";
	const name = request.headers.get("X-GitHub-Event") as WebhookEventName;
	const rawPayload = JSON.parse(body);

	try {
		await handleEvent({ id, name, payload: rawPayload });
	} catch (e) {
		if (e instanceof WebhookPayloadError) {
			return new Response(e.message, { status: 400 });
		}
		throw e;
	}

	return new Response("Accepted", { status: 202 });
}
