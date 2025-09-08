import type { UIMessage } from "ai";
import { create } from "zustand";
import type { Generation, RunningGeneration } from "../../concepts/generation";
import type { GenerationId } from "../../concepts/identifiers";

interface GenerationStore {
	generations: Generation[];
	setGenerations: (generations: Generation[]) => void;
	addGenerationRunner: (generation: Generation | Generation[]) => void;
	updateGeneration: (generation: Generation) => void;
	updateMessages: (id: GenerationId, messages: UIMessage[]) => void;
	// addStopHandler: (id: GenerationId, handler: () => void) => void;
	// removeStopHandler: (id: GenerationId) => void;
}

export const useGenerationStore = create<GenerationStore>((set) => ({
	generations: [],
	generationListener: {},
	stopHandlers: {},
	setGenerations: (generations) =>
		set({
			generations,
		}),
	addGenerationRunner: (generations) =>
		set((state) => {
			const arr = Array.isArray(generations) ? generations : [generations];
			return {
				generations: [...state.generations, ...arr],
			};
		}),
	updateGeneration: (generation) =>
		set((state) => ({
			generations: state.generations.map((g) =>
				g.id === generation.id ? generation : g,
			),
		})),
	updateMessages: (id, messages) =>
		set((state) => {
			return {
				generations: state.generations.map((g) =>
					g.id === id
						? {
								...g,
								messages,
							}
						: g,
				),
			};
		}),
	// addStopHandler: (id, handler) =>
	// 	set((state) => ({
	// 		stopHandlers: { ...state.stopHandlers, [id]: handler },
	// 	})),
	// removeStopHandler: (id) =>
	// 	set((state) => {
	// 		const { [id]: _, ...rest } = state.stopHandlers;
	// 		return { stopHandlers: rest };
	// 	}),
}));
