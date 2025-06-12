import { createIdGenerator } from "@giselle-sdk/utils";
import { z } from "zod/v4";
import { WorkspaceId } from "../workspace";

export const SecretId = createIdGenerator("scrt");
export type SecretId = z.infer<typeof SecretId.schema>;

export const Secret = z.object({
	id: SecretId.schema,
	label: z.string(),
	value: z.string(),
	createdAt: z.number(),
	workspaceId: WorkspaceId.schema,
});

export type Secret = z.infer<typeof Secret>;

export const SecretIndex = Secret.pick({
	id: true,
	label: true,
	createdAt: true,
	workspaceId: true,
});
export type SecretIndex = z.infer<typeof SecretIndex>;
