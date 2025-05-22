import { handleWebhook, verifyRequest } from "@giselle-sdk/github-tool";
import type { GiselleEngineContext } from "../types";

export async function handleGitHubWebhookV2(args: {
	context: GiselleEngineContext;
	request: Request;
}) {
	const credentials = args.context.integrationConfigs?.github?.authV2;
	if (credentials === undefined) {
		throw new Error("GitHub credentials not found");
	}

	await handleWebhook({
		secret: credentials.webhookSecret,
		request: args.request,
		on: {
			"issue_comment.created": async (event) => {},
		},
	});
}
