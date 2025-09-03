import type { NodeLike } from "@giselle-sdk/data-type";
import type { LanguageModelProvider } from "@giselle-sdk/language-model";
import type { StateCreator } from "zustand";
import type { GiselleEngineClient } from "../../use-giselle-engine";
import type { WorkspaceSlice } from "./workspaceSlice";

// A creator function for a slice must now include the full store type
// to enable cross-slice actions, e.g., get().deleteNode()
export type ViewSliceCreator = StateCreator<
	WorkspaceSlice & ViewSlice,
	[],
	[],
	ViewSlice
>;

export interface ViewSlice {
	isLoading: boolean;
	llmProviders: LanguageModelProvider[];
	copiedNode: NodeLike | null;
	setCopiedNode: (node: NodeLike | null) => void;
	loadInitialData: (client: GiselleEngineClient) => Promise<void>;
}

export const createViewSlice: ViewSliceCreator = (set) => ({
	isLoading: true,
	llmProviders: [],
	copiedNode: null,
	setCopiedNode: (node) => set({ copiedNode: node }),
	loadInitialData: async (client) => {
		set({ isLoading: true });
		try {
			const providers = await client.getLanguageModelProviders();
			set({ llmProviders: providers, isLoading: false });
		} catch (error) {
			console.error("Failed to load language model providers:", error);
			set({ isLoading: false });
		}
	},
});
