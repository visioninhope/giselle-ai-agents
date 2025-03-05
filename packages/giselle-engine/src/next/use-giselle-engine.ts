import type { NextResponse } from "next/server";
import { useCallback, useMemo } from "react";
import type { AnyZodObject, z } from "zod";
import {
	type RouterHandlers,
	type RouterInput,
	type RouterPaths,
	routerPaths,
} from "./router";

type FetchOptions = {
	baseUrl?: string;
};

type ExtractResponseData<T> = T extends NextResponse<infer U>
	? U
	: T extends Promise<infer U>
		? U
		: T;

type MethodWithInput<P extends RouterPaths> = (
	input: RouterInput[P] extends z.AnyZodObject
		? z.infer<RouterInput[P]>
		: never,
) => Promise<ExtractResponseData<Awaited<ReturnType<RouterHandlers[P]>>>>;

type MethodWithoutInput<P extends RouterPaths> = () => Promise<
	ExtractResponseData<Awaited<ReturnType<RouterHandlers[P]>>>
>;

type GiselleEngineClient = {
	[P in RouterPaths]: RouterInput[P] extends AnyZodObject
		? MethodWithInput<P>
		: MethodWithoutInput<P>;
} & {
	getRequestUrl: (path: RouterPaths) => string;
};

/**
 * Custom hook that provides a type-safe client for the GiselleEngine API
 *
 * @param options Configuration options for the client
 * @returns A client object with methods for each GiselleEngine operation
 */
export function useGiselleEngine(options?: FetchOptions): GiselleEngineClient {
	const baseUrl = options?.baseUrl ?? "/api/giselle";

	/**
	 * Generic fetch function that handles API requests with proper typing
	 */
	const fetchApi = useCallback(
		async <TPath extends RouterPaths>(
			path: TPath,
			input?: RouterInput[TPath],
		) => {
			const response = await fetch(`${baseUrl}/${path}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: input ? JSON.stringify(input) : undefined,
			});

			if (!response.ok) {
				const error = await response.text();
				throw new Error(error || `Error in ${path} operation`);
			}

			// Handle both JSON responses and stream responses
			const contentType = response.headers.get("Content-Type");
			if (contentType?.includes("application/json")) {
				return await response.json();
			}

			return response;
		},
		[baseUrl],
	);

	/**
	 * Creates a method for a specific router path
	 */
	const createMethod = useCallback(
		<TPath extends RouterPaths>(path: TPath) => {
			type InputType = RouterInput[TPath];

			// Create a function that is correctly typed based on whether input is required
			return ((input?: InputType extends undefined ? never : InputType) => {
				// @ts-expect-error
				return fetchApi(path, input as unknown);
			}) as GiselleEngineClient[TPath];
		},
		[fetchApi],
	);

	/**
	 * Generate the client object with all router methods
	 */
	const client = useMemo(() => {
		const methods = routerPaths.reduce(
			(acc, path) => {
				// @ts-expect-error
				acc[path] = createMethod(path);
				return acc;
			},
			{} as Partial<GiselleEngineClient>,
		);

		return {
			...methods,
			getRequestUrl: (path: RouterPaths) => `${baseUrl}/${path}`,
		} as GiselleEngineClient;
	}, [baseUrl, createMethod]);

	return client;
}
