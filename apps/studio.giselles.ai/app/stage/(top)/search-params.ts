import { createLoader, parseAsString } from "nuqs/server";

export const stageTopSearchParams = {
	appId: parseAsString.withDefault(""),
};

export const loadSearchParams = createLoader(stageTopSearchParams);
