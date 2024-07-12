import type { InferResponse } from "@/lib/api";
import { fetcher } from "@/lib/fetcher";
import { useCallback } from "react";
import useSWR from "swr";
import { useAgentUrlId } from "../use-agent-url-id";
import type { POST } from "./build/route";
import type { GET } from "./route";

export const getWorkspaceRequestKey = (urlId: string) =>
	`/agents/${urlId}/blueprints`;

type ApiResponse = InferResponse<typeof GET>;

type AssertBuildBlueprintReponse = (
	value: unknown,
) => asserts value is InferResponse<typeof POST>;
/** @todo */
export const assertBuildResponse: AssertBuildBlueprintReponse = () => {};

export const useBlueprint = () => {
	const urlId = useAgentUrlId();
	const { data, mutate } = useSWR<ApiResponse>(
		getWorkspaceRequestKey(urlId),
		fetcher,
	);
	const buildCurrent = useCallback(async () => {
		const json = await fetch(`/agents/${urlId}/blueprints/build`, {
			method: "POST",
		}).then((res) => res.json());
		assertBuildResponse(json);
		return json;
	}, [urlId]);

	return { blueprint: data?.blueprint, mutateBlueprint: mutate, buildCurrent };
};
