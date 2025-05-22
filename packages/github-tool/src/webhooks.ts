import {
	type EmitterWebhookEvent,
	type EmitterWebhookEventName,
	Webhooks,
	createEventHandler,
} from "@octokit/webhooks";
import { GitHubWebhookUnauthorizedError } from "./errors";

export async function verifyRequest({
	secret,
	request,
}: { secret: string; request: Request }) {
	const webhooks = new Webhooks({ secret });

	const signature = request.headers.get("x-hub-signature-256") ?? "";

	const body = await request.clone().text();

	const verified = await webhooks.verify(body, signature);

	if (!verified) {
		throw new GitHubWebhookUnauthorizedError();
	}
}

type EventHandlers = {
	[K in EmitterWebhookEventName]: (
		event: EmitterWebhookEvent<K>,
	) => Promise<void>;
};
export async function handleWebhook(args: {
	secret: string;
	request: Request;
	on: Partial<EventHandlers>;
}) {
	const eventHandler = createEventHandler({
		secret: args.secret,
	});
	const webhookEventNames = Object.keys(args.on) as EmitterWebhookEventName[];
	for (const webhookEventName of webhookEventNames) {
		eventHandler.on(webhookEventName, async (event) => {
			// biome-ignore lint: lint/suspicious/noExplicitAny: Although type inference is broken, the implementation is type-safe
			await args.on[webhookEventName]?.(event as any);
		});
	}

	await eventHandler.receive({
		id: args.request.headers.get("x-github-delivery") ?? "",
		// biome-ignore lint: lint/suspicious/noExplicitAny: Using 'any' is acceptable here as unexpected values won't cause issues
		name: args.request.headers.get("x-github-event") as any,
		payload: await args.request.clone().json(),
	});
}
