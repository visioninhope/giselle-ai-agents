import { createContext, useContext } from "react";

interface BetaContextValue {
	githubTools: boolean;
}
export const Beta = createContext<BetaContextValue | undefined>(undefined);

export function useBeta(): BetaContextValue {
	const context = useContext(Beta);
	if (!context) {
		throw new Error("useBeta must be used within a BetaProvider");
	}
	return context;
}
