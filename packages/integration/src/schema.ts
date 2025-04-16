import { z } from "zod";
import { GitHubIntegrationState } from "./github";
export * from "./github";

export const Integration = z.object({
	github: GitHubIntegrationState,
});
export type Integration = z.infer<typeof Integration>;
