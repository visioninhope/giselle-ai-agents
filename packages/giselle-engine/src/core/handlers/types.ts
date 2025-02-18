import type { GiselleEngineContext } from "../types";

export type GiselleEngineHandlerArgs<TInput = void> = {
	context: GiselleEngineContext;
} & (TInput extends void ? Record<never, never> : { unsafeInput: unknown });
