import { createContext, useContext } from "react";
import type { RequestState } from "./types";

export const RequestContext = createContext<RequestState | null>(null);

export const useRequest = () => {
	const context = useContext(RequestContext);
	if (!context) {
		throw new Error("useRequest must be used within a RequestProvider");
	}
	return context;
};
