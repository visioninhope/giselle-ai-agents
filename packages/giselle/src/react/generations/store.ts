import type { UIMessage } from "ai";
import { create } from "zustand";
import type { Generation, RunningGeneration } from "../../concepts/generation";
import type { GenerationId } from "../../concepts/identifiers";

interface GenerationStore {
	generations: Generation[];
	generationListener: Record<GenerationId, Generation>;
	stopHandlers: Record<GenerationId, () => void>;
	setGenerations: (generations: Generation[]) => void;
	addGenerationRunner: (generation: Generation | Generation[]) => void;
	updateGeneration: (generation: Generation) => void;
	updateMessages: (id: GenerationId, messages: UIMessage[]) => void;
	addStopHandler: (id: GenerationId, handler: () => void) => void;
	removeStopHandler: (id: GenerationId) => void;
}

export const useGenerationStore = create<GenerationStore>((set) => ({
	generations: [],
	generationListener: {},
	stopHandlers: {},
	setGenerations: (generations) =>
		set({
			generations,
			generationListener: Object.fromEntries(generations.map((g) => [g.id, g])),
		}),
	addGenerationRunner: (generations) =>
		set((state) => {
			const arr = Array.isArray(generations) ? generations : [generations];
			const listener = { ...state.generationListener };
			for (const g of arr) {
				listener[g.id] = g;
			}
			return {
				generations: [...state.generations, ...arr],
				generationListener: listener,
			};
		}),
	updateGeneration: (generation) =>
		set((state) => ({
			generations: state.generations.map((g) =>
				g.id === generation.id ? generation : g,
			),
			generationListener: {
				...state.generationListener,
				[generation.id]: generation,
			},
		})),
	updateMessages: (id, messages) =>
		set((state) => {
			const current = state.generationListener[id];
			if (!current || current.status !== "running") {
				return {};
			}
			const updated: RunningGeneration = {
				...current,
				messages,
			};
			return {
				generations: state.generations.map((g) => (g.id === id ? updated : g)),
				generationListener: {
					...state.generationListener,
					[id]: updated,
				},
			};
		}),
	addStopHandler: (id, handler) =>
		set((state) => ({
			stopHandlers: { ...state.stopHandlers, [id]: handler },
		})),
	removeStopHandler: (id) =>
		set((state) => {
			const { [id]: _, ...rest } = state.stopHandlers;
			return { stopHandlers: rest };
		}),
}));
