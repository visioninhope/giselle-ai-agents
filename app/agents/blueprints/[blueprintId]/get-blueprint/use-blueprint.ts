"use client";

import {
	inferRequestInterface,
	reviewRequiredActions,
	useBlueprintId,
} from "@/app/agents/blueprints";
import type { InferResponse } from "@/lib/api";
import { fetcher } from "@/lib/fetcher";
import { useCallback, useMemo } from "react";
import useSWR from "swr";
import invariant from "tiny-invariant";
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
				() =>
					sendRequest.then((json) => {
						invariant(data != null, "invalid state: blueprint is null");
						const tmp = mutateWithCache(data, json);
						const requiredActions = reviewRequiredActions(tmp.blueprint);
						const requestInterface = inferRequestInterface(tmp.blueprint);
						return {
							blueprint: {
								...tmp.blueprint,
								requiredActions,
								requestInterface,
							},
						};
					}),
				{
					revalidate: false,
					optimisticData: () => {
						invariant(data != null, "invalid state: blueprint is null");

						const tmp = optimisticDataWithCache(data);
						const requiredActions = reviewRequiredActions(tmp.blueprint);
						const requestInterface = inferRequestInterface(tmp.blueprint);
						return {
							blueprint: {
								...tmp.blueprint,
								requiredActions,
								requestInterface,
							},
						};
					},
				},
			);
		},
		[mutate, data],
	);
	return { blueprint: data?.blueprint, mutateWithCache };
};

export const useNode = (nodeId: number) => {
	const { blueprint } = useBlueprint();
	const node = useMemo(
		() => blueprint?.nodes.find(({ id }) => id === nodeId),
		[blueprint, nodeId],
	);
	return node;
};

export const useRequiredActions = () => {
	const { blueprint } = useBlueprint();
	return blueprint?.requiredActions;
};

export const useRequestInterface = () => {
	const { blueprint } = useBlueprint();
	return blueprint?.requestInterface;
};
