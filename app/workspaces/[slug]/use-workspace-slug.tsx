import React, {
	createContext,
	type FC,
	type PropsWithChildren,
	useContext,
	useState,
} from "react";
import invariant from "tiny-invariant";

const WorkspaceSlugContext = createContext<string | null>(null);

export const WorkspaceSlugProvider: FC<PropsWithChildren<{ slug: string }>> = ({
	children,
	slug,
}) => {
	return (
		<WorkspaceSlugContext.Provider value={slug}>
			{children}
		</WorkspaceSlugContext.Provider>
	);
};

export const useWorkspaceSlug = () => {
	const slug = useContext(WorkspaceSlugContext);
	invariant(
		slug !== null,
		"useWorkspaceSlugContext is used in WorkspaceSlugContextProvider",
	);
	return slug;
};
