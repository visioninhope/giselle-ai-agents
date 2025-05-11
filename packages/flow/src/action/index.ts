import { actions as githubActions, provider as githubProvider } from "./github";

export {
	actions as githubActions,
	provider as githubProvider,
	type ActionCommandId as GitHubActionComandId,
} from "./github";

export const actions = [...githubActions];
export type ActionProvider = typeof githubProvider;
export const actionProviders = [githubProvider];
