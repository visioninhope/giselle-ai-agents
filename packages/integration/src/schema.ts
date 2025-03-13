import { z } from "zod";
import { GitHubIntegration } from "./github";
export * from "./github";

export const Integration = z.object({
	github: GitHubIntegration,
});
export type Integration = z.infer<typeof Integration>;
