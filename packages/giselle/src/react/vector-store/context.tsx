import { createContext, type PropsWithChildren, useContext } from "react";
import type {
	GitHubPullRequestVectorStoreInfo,
	GitHubVectorStoreInfo,
} from "../../engine/vector-store";

export interface VectorStoreContextValue {
	github: GitHubVectorStoreInfo[];
	githubPullRequest?: GitHubPullRequestVectorStoreInfo[];
	settingPath: string;
}

export const VectorStoreContext = createContext<
	Partial<VectorStoreContextValue> | undefined
>(undefined);

export interface VectorStoreProviderProps {
	value?: Partial<VectorStoreContextValue>;
}
export function VectorStoreProvider({
	children,
	...props
}: PropsWithChildren<VectorStoreProviderProps>) {
	return (
		<VectorStoreContext.Provider value={props.value}>
			{children}
		</VectorStoreContext.Provider>
	);
}

export const useVectorStore = () => {
	const vectorStore = useContext(VectorStoreContext);
	return vectorStore;
};
