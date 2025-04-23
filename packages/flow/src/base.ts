import type { z } from "zod";

export interface TriggerBase {
	provider: string;
	id: string;
	label?: string;
	description?: string;
	payloads?: z.AnyZodObject;
}
