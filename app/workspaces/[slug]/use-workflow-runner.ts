// import type { ResponseJson } from "@/app/api/workspaces/[slug]/workflows/route";
import { fetcher } from "@/lib/fetcher";
import { useCallback, useState } from "react";
import useSWR from "swr";

export const useWorkflowRunner = (slug: string) => {
	const [latestRunId, setLatestRunId] = useState<number | undefined>(undefined);
	const [optimisticData, setOptimisticData] = useState<ResponseJson | null>(
		null,
	);
	const { data, mutate } = useSWR<ResponseJson>(() => {
		if (latestRunId == null) {
			return false;
		}
		return `/api/workflows/${slug}/runs/${latestRunId}`;
	}, fetcher);
	const run = useCallback(async () => {
		setOptimisticData({
			run: {
				id: 0,
				status: "optimistic",
				workflowId: 0,
				runningNodeId: null,
			},
		});
		const startedRun = await fetch(`/api/workflows/${slug}/runs`, {
			method: "POST",
			headers: {
				contentType: "application/json",
			},
		}).then((res) => res.json() as Promise<ResponseJson>);

		setLatestRunId(startedRun.run.id);
	}, [slug]);
	return {
		run,
		latestRun: data ?? optimisticData,
	};
};
