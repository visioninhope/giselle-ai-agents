import type { LanguageModelProvider } from "@giselle-sdk/language-models";
import type { Storage } from "unstorage";

export interface GiselleEngineContext {
	storage: Storage;
	llmProviders: LanguageModelProvider[];
}
