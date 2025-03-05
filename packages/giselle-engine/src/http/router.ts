import {
	QueuedGeneration,
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
