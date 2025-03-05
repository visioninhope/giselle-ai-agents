import {
	CreatedRun,
	GenerationId,
	GenerationOrigin,
	NodeId,
	QueuedGeneration,
	RunId,
	WorkflowId,
	Workspace,
	WorkspaceId,
} from "@giselle-sdk/data-type";
import { z } from "zod";
import type { GiselleEngine } from "../core";
import { JsonResponse } from "../utils";
import { createHandler } from "./create-handler";

export const createRouters = {
	createWorkspace: (giselleEngine: GiselleEngine) =>
		createHandler({
			handler: async () => {
				const workspace = await giselleEngine.createWorkspace();
				return JsonResponse.json(workspace);
			},
		}),
	getWorkspace: (giselleEngine: GiselleEngine) =>
		createHandler({
			input: z.object({ workspaceId: WorkspaceId.schema }),
			handler: async ({ input }) => {
				const workspace = await giselleEngine.getWorkspace(input.workspaceId);
				return JsonResponse.json(workspace);
			},
		}),

	updateWorkspace: (giselleEngine: GiselleEngine) =>
		createHandler({
			input: z.object({
				workspace: Workspace,
			}),
			handler: async ({ input }) => {
				const workspace = await giselleEngine.updateWorkspace(input.workspace);
				return JsonResponse.json(workspace);
			},
		}),
	getLanguageModelProviders: (giselleEngine: GiselleEngine) =>
		createHandler({
			handler: async () => {
				const providers = await giselleEngine.getLanguageModelProviders();
				return JsonResponse.json(providers);
			},
		}),
	generateText: (giselleEngine: GiselleEngine) =>
		createHandler({
			input: z.object({ generation: QueuedGeneration }),
			handler: async ({ input }) => {
				const stream = await giselleEngine.generateText(input.generation);
				return stream.toDataStreamResponse();
			},
		}),
	getGeneration: (giselleEngine: GiselleEngine) =>
		createHandler({
			input: z.object({ generationId: GenerationId.schema }),
			handler: async ({ input }) => {
				const generation = await giselleEngine.getGeneration(
					input.generationId,
				);
				return JsonResponse.json(generation);
			},
		}),
	getNodeGenerations: (giselleEngine: GiselleEngine) =>
		createHandler({
			input: z.object({
				origin: GenerationOrigin,
				nodeId: NodeId.schema,
			}),
			handler: async ({ input }) => {
				const generations = await giselleEngine.getNodeGenerations(
					input.origin,
					input.nodeId,
				);
				return JsonResponse.json(generations);
			},
		}),
	cancelGeneration: (giselleEngine: GiselleEngine) =>
		createHandler({
			input: z.object({ generationId: GenerationId.schema }),
			handler: async ({ input }) => {
				const generation = await giselleEngine.cancelGeneration(
					input.generationId,
				);
				return JsonResponse.json(generation);
			},
		}),

	addRun: (giselleEngine: GiselleEngine) =>
		createHandler({
			input: z.object({
				workspaceId: WorkspaceId.schema,
				workflowId: WorkflowId.schema,
				run: CreatedRun,
			}),
			handler: async ({ input }) => {
				const run = await giselleEngine.addRun(
					input.workspaceId,
					input.workflowId,
					input.run,
				);
				return JsonResponse.json(run);
			},
		}),
	startRun: (giselleEngine: GiselleEngine) =>
		createHandler({
			input: z.object({ runId: RunId.schema }),
			handler: async ({ input }) => {
				await giselleEngine.startRun(input.runId);
				return new Response(null, { status: 202 });
			},
		}),
} as const;

export const routerPaths = Object.keys(createRouters) as RouterPaths[];

// Export the types at module level
export type RouterPaths = keyof typeof createRouters;
export type RouterHandlers = {
	[P in RouterPaths]: ReturnType<(typeof createRouters)[P]>;
};
export type RouterInput = {
	[P in RouterPaths]: Parameters<RouterHandlers[P]>[0]["input"];
};
export function isRouterPath(path: string): path is RouterPaths {
	return path in createRouters;
}
