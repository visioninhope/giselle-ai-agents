"use client";

import type { InferResponse } from "@/lib/api";
import { fetcher } from "@/lib/fetcher";
import { useCallback, useMemo } from "react";
import useSWR from "swr";
import invariant from "tiny-invariant";
import { useBlueprintId } from "../../";
import type { GET } from "./route";

type ApiResponse = InferResponse<typeof GET>;
const key = (blueprintId?: number) => {
	if (blueprintId == null) {
		return false;
	}
	return `/agents/blueprints/${blueprintId}/get-blueprint`;
};
// biome-ignore lint: lint/suspicious/noExplicitAny
type MutateArgs<T extends Promise<any>> = {
	sendRequest: T;
	mutateWithCache: (
		prev: ApiResponse,
		json: T extends Promise<infer U> ? Awaited<U> : never,
	) => ApiResponse;
	optimisticDataWithCache: (prev: ApiResponse) => ApiResponse;
};

export const useBlueprint = () => {
	const blueprintId = useBlueprintId();
	const { data, mutate } = useSWR<ApiResponse>(key(blueprintId), fetcher);
	const mutateWithCache = useCallback(
		// biome-ignore lint: lint/suspicious/noExplicitAny
		<T extends Promise<any>>({
			sendRequest,
			mutateWithCache,
			optimisticDataWithCache,
		}: MutateArgs<T>) => {
			mutate(
				(prev) =>
					sendRequest.then((json) => {
						invariant(prev != null, "invalid state: blueprint is null");
						return mutateWithCache(prev, json);
					}),
				{
					revalidate: false,
					optimisticData: (prev) => {
						invariant(prev != null, "invalid state: blueprint is null");
						return optimisticDataWithCache(prev);
					},
				},
			);
		},
		[mutate],
	);
	return { blueprint: data?.blueprint, mutateWithCache };
};

export const useNode = (nodeId: number) => {
	const { blueprint } = useBlueprint();
	const node = useMemo(() => {
		const n = blueprint?.nodes.find(({ id }) => id === nodeId);
		invariant(n != null, `invalid state: node ${nodeId} not found`);
		return n;
	}, [blueprint, nodeId]);
	return node;
};
