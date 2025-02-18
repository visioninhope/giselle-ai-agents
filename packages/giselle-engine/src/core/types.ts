import type { LLMProvider } from "@giselle-sdk/data-type";
import type { Storage } from "unstorage";

export interface GiselleEngineContext {
	storage: Storage;
	llmProviders: LLMProvider[];
}
