import { GitHubIntegrationContext, type Repository } from "./context";

interface GitHubIntegrationProviderProps {
	children: React.ReactNode;
	repositories: Repository[];
	needsAuthorization: boolean;
}
export function GitHubIntegrationProvider({
	children,
	repositories,
	needsAuthorization,
}: GitHubIntegrationProviderProps) {
	return (
		<GitHubIntegrationContext.Provider
			value={{
				repositories,
				needsAuthorization,
			}}
		>
			{children}
		</GitHubIntegrationContext.Provider>
	);
}
