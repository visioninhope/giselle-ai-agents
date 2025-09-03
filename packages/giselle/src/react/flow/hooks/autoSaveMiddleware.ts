import type { StateCreator, StoreMutatorIdentifier } from "zustand";

// Define the types for the middleware
type AutoSave = <
	T extends object,
	Mps extends [StoreMutatorIdentifier, unknown][] = [],
	Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
	f: StateCreator<T, Mps, Mcs>,
	options: {
		save: (state: T) => Promise<void>;
		saveDelay?: number;
		// A part of the state that can be used to skip saving
		skipSaveFlag?: keyof T;
	},
) => StateCreator<T, Mps, Mcs>;

type AutoSaveImpl = <T extends object>(
	f: StateCreator<T, [], []>,
	options: {
		save: (state: T) => Promise<void>;
		saveDelay?: number;
		skipSaveFlag?: keyof T;
	},
) => StateCreator<T, [], []>;

const autoSaveImpl: AutoSaveImpl = (f, options) => (set, get, api) => {
	const { save, saveDelay = 1000, skipSaveFlag } = options;
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	// Subscribe to the store's changes
	api.subscribe((state, prevState) => {
		// If a skip flag is provided and it's true, skip saving
		if (skipSaveFlag && get()[skipSaveFlag]) {
			// Reset the flag immediately after checking
			set({ [skipSaveFlag]: false } as Partial<T>);
			return;
		}

		// Debounce the save function
		if (timeoutId) {
			clearTimeout(timeoutId);
		}
		timeoutId = setTimeout(() => {
			save(get());
		}, saveDelay);
	});

	return f(set, get, api);
};

export const autoSave = autoSaveImpl as AutoSave;
