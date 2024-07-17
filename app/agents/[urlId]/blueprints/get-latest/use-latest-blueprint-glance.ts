"use client";

import type { InferResponse } from "@/lib/api";
import { fetcher } from "@/lib/fetcher";
import useSWR from "swr";
import type { GET } from "./route";

export const useLatestBlueprintGlance = (urlId: string) => {
	const { data } = useSWR<InferResponse<typeof GET>>(
		`/agents/${urlId}/blueprints/get-latest`,
		fetcher,
	);

	return { latestBlueprintGlance: data?.blueprint };
};
