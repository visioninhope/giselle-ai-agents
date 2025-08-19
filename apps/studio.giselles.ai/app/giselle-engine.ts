import { WorkspaceId } from "@giselle-sdk/data-type";
import { NextGiselleEngine } from "@giselle-sdk/giselle/next";
import { traceGeneration } from "@giselle-sdk/langfuse";
import {
	supabaseStorageDriver as experimental_supabaseStorageDriver,
	supabaseVaultDriver,
} from "@giselle-sdk/supabase-driver";
import { openaiVectorStore } from "@giselle-sdk/vector-store-adapters";
import { after } from "next/server";
import { createStorage } from "unstorage";
import { waitForLangfuseFlush } from "@/instrumentation.node";
import { getWorkspaceTeam } from "@/lib/workspaces/get-workspace-team";
import { fetchUsageLimits } from "@/packages/lib/fetch-usage-limits";
import { onConsumeAgentTime } from "@/packages/lib/on-consume-agent-time";
import { fetchCurrentUser } from "@/services/accounts";
import { fetchCurrentTeam, isProPlan } from "@/services/teams";
import supabaseStorageDriver from "@/supabase-storage-driver";
import {
	gitHubPullRequestQueryService,
	gitHubQueryService,
} from "../lib/vector-stores/github";

export const publicStorage = createStorage({
	driver: supabaseStorageDriver({
		supabaseUrl: process.env.SUPABASE_URL ?? "",
		supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY ?? "",
		bucket: "public-assets",
	}),
});

const storage = createStorage({
	driver: supabaseStorageDriver({
		supabaseUrl: process.env.SUPABASE_URL ?? "",
		supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY ?? "",
		bucket: "app",
	}),
});

const experimental_storage = experimental_supabaseStorageDriver({
	endpoint: process.env.SUPABASE_STORAGE_URL ?? "",
	region: process.env.SUPABASE_STORAGE_REGION ?? "",
	accessKeyId: process.env.SUPABASE_STORAGE_ACCESS_KEY_ID ?? "",
	secretAccessKey: process.env.SUPABASE_STORAGE_SECRET_ACCESS_KEY ?? "",
	bucket: "app",
});

const vault = supabaseVaultDriver({
	url: process.env.SUPABASE_URL ?? "",
	serviceKey: process.env.SUPABASE_SERVICE_KEY ?? "",
});

const sampleAppWorkspaceId = WorkspaceId.parse(
	process.env.SAMPLE_APP_WORKSPACE_ID,
);

const githubAppId = process.env.GITHUB_APP_ID;
const githubAppPrivateKey = process.env.GITHUB_APP_PRIVATE_KEY;
const githubAppClientId = process.env.GITHUB_APP_CLIENT_ID;
const githubAppClientSecret = process.env.GITHUB_APP_CLIENT_SECRET;
const githubAppWebhookSecret = process.env.GITHUB_APP_WEBHOOK_SECRET;

if (
	githubAppId === undefined ||
	githubAppPrivateKey === undefined ||
	githubAppClientId === undefined ||
	githubAppClientSecret === undefined ||
	githubAppWebhookSecret === undefined
) {
	throw new Error("missing github credentials");
}

export const giselleEngine = NextGiselleEngine({
	basePath: "/api/giselle",
	storage,
	experimental_storage,
	llmProviders: ["openai", "anthropic", "google", "perplexity", "fal"],
	onConsumeAgentTime,
	telemetry: {
		isEnabled: true,
		waitForFlushFn: waitForLangfuseFlush,
	},
	fetchUsageLimitsFn: fetchUsageLimits,
	sampleAppWorkspaceId,
	integrationConfigs: {
		github: {
			auth: {
				strategy: "app-installation",
				appId: "",
				privateKey: "",
				resolver: {
					installationIdForRepo: () => 1234,
					installtionIds: () => [1234],
				},
			},
			authV2: {
				appId: githubAppId,
				privateKey: githubAppPrivateKey,
				clientId: githubAppClientId,
				clientSecret: githubAppClientSecret,
				webhookSecret: githubAppWebhookSecret,
			},
		},
	},
	vault,
	vectorStoreQueryServices: {
		github: gitHubQueryService,
		githubPullRequest: gitHubPullRequestQueryService,
	},
	callbacks: {
		generationComplete: (args) => {
			after(async () => {
				try {
					switch (args.generation.context.origin.type) {
						case "github-app": {
							const workspaceTeam = await getWorkspaceTeam(
								args.generation.context.origin.workspaceId,
							);
							const plan = isProPlan(workspaceTeam) ? "plan:pro" : "plan:free";
							const teamType = `teamType:${workspaceTeam.type}`;
							await traceGeneration({
								generation: args.generation,
								outputFileBlobs: args.outputFileBlobs,
								inputMessages: args.inputMessages,
								userId: "github-app",
								tags: [plan, teamType],
								metadata: {
									generationId: args.generation.id,
									isProPlan: isProPlan(workspaceTeam),
									teamType: workspaceTeam.type,
									userId: "github-apps",
									subscriptionId: workspaceTeam.activeSubscriptionId ?? "",
								},
								sessionId: args.generation.context.origin.actId,
							});
							break;
						}
						case "stage":
						case "studio": {
							const currentUser = await fetchCurrentUser();
							const currentTeam = await fetchCurrentTeam();
							const plan = isProPlan(currentTeam) ? "plan:pro" : "plan:free";
							const teamType = `teamType:${currentTeam.type}`;
							await traceGeneration({
								generation: args.generation,
								outputFileBlobs: args.outputFileBlobs,
								inputMessages: args.inputMessages,
								userId: currentUser.id,
								tags: [plan, teamType],
								metadata: {
									generationId: args.generation.id,
									isProPlan: isProPlan(currentTeam),
									teamType: currentTeam.type,
									userId: currentUser.id,
									subscriptionId: currentTeam.activeSubscriptionId ?? "",
								},
								sessionId: args.generation.context.origin.actId,
							});
							break;
						}
						default: {
							const _exhaustiveCheck: never = args.generation.context.origin;
							throw new Error(`Unhandled origin type: ${_exhaustiveCheck}`);
						}
					}
				} catch (error) {
					console.error("Trace generation failed:", error);
				}
			});
		},
	},
	vectorStore: openaiVectorStore(process.env.OPENAI_API_KEY ?? ""),
});
