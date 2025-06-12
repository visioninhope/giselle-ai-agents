import { createIdGenerator } from "@giselle-sdk/utils";
import { z } from "zod/v4";

export const SecretId = createIdGenerator("scrt");
export type SecretId = z.infer<typeof SecretId.schema>;

export const Secret = z.object({
	id: SecretId.schema,
	label: z.string(),
	value: z.string(),
	createdAt: z.number(),
});

export type Secret = z.infer<typeof Secret>;
