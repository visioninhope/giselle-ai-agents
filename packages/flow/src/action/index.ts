import { actions as githubActions, provider as githubProvider } from "./github";
import {
	actions as webSearchActions,
	provider as webSearchProvider,
} from "./web-search";

export {
	actions as githubActions,
	provider as githubProvider,
	type ActionCommandId as GitHubActionCommandId,
	actionIdToLabel as githubActionIdToLabel,
	type GitHubAction,
} from "./github";

export {
	actions as webSearchActions,
	provider as webSearchProvider,
	type ActionCommandId as WebSearchActionCommandId,
	actionIdToLabel as webSearchActionIdToLabel,
	type WebSearchAction,
} from "./web-search";

export type ActionProvider = typeof githubProvider | typeof webSearchProvider;
export const actionProviders = [githubProvider, webSearchProvider];
