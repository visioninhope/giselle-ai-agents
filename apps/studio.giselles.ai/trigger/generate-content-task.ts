import {
	type CompletedGeneration,
	type FailedGeneration,
	GenerationId,
	isRunningGeneration,
	type OutputFileBlob,
} from "@giselle-sdk/giselle";
import { traceGeneration } from "@giselle-sdk/langfuse";
import { logger, schemaTask } from "@trigger.dev/sdk";
import type { ModelMessage, ProviderMetadata } from "ai";
import { z } from "zod/v4";
import { giselleEngine } from "@/app/giselle-engine";
import { type CurrentTeam, isProPlan } from "@/services/teams";

type TeamForPlan = Pick<CurrentTeam, "id" | "activeSubscriptionId" | "type">;

async function traceGenerationForTeam(args: {
	generation: CompletedGeneration | FailedGeneration;
	inputMessages: ModelMessage[];
	outputFileBlobs?: OutputFileBlob[];
	sessionId?: string;
	userId: string;
	team: TeamForPlan;
	providerMetadata?: ProviderMetadata;
	requestId?: string | undefined;
}) {
	const isPro = isProPlan(args.team);
	const planTag = isPro ? "plan:pro" : "plan:free";
	const teamTypeTag = `teamType:${args.team.type}`;

	await traceGeneration({
		generation: args.generation,
		outputFileBlobs: args.outputFileBlobs,
		inputMessages: args.inputMessages,
		userId: args.userId,
		tags: [planTag, teamTypeTag],
		metadata: {
			generationId: args.generation.id,
			isProPlan: isPro,
			teamType: args.team.type,
			userId: args.userId,
			subscriptionId: args.team.activeSubscriptionId ?? "",
			providerMetadata: args.providerMetadata,
			requestId: args.requestId,
		},
		sessionId: args.sessionId,
	});
}

export const generateContentTask = schemaTask({
	id: "generate-content",
	schema: z.object({
		generationId: GenerationId.schema,
		requestId: z.string().optional(),
		userId: z.string(),
		team: z.object({
			id: z.string<`tm_${string}`>(),
			type: z.enum(["customer", "internal"]),
			subscriptionId: z.string().nullable(),
		}),
	}),
	run: async (payload) => {
		const generation = await giselleEngine.getGeneration(
			payload.generationId,
			true,
		);
		if (!isRunningGeneration(generation)) {
			return {
				message: `Generation ${payload.generationId} is not running.`,
			};
		}
		const result = await giselleEngine.generateContent({ generation, logger });
		if (!result.success) {
			await traceGenerationForTeam({
				generation: result.failedGeneration,
				inputMessages: result.inputMessages,
				sessionId: generation.context.origin.actId,
				userId: payload.userId,
				team: {
					id: payload.team.id,
					activeSubscriptionId: payload.team.subscriptionId,
					type: payload.team.type,
				},
				requestId: payload.requestId,
			});
			return;
		}
		await traceGenerationForTeam({
			generation: result.completedGeneration,
			inputMessages: result.inputMessages,
			outputFileBlobs: result.outputFileBlobs,
			sessionId: generation.context.origin.actId,
			userId: payload.userId,
			team: {
				id: payload.team.id,
				activeSubscriptionId: payload.team.subscriptionId,
				type: payload.team.type,
			},
			providerMetadata: result.providerMetadata,
			requestId: payload.requestId,
		});
		return;
	},
});
