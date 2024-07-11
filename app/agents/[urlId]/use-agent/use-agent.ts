import type { InferResponse } from "@/lib/api";
import { fetcher } from "@/lib/fetcher";
import useSWR from "swr";
import { useAgentUrlId } from "../use-agent-url-id";
import { assertAgentState } from "./agent-state";
import type { GET } from "./route";

const execApi = async (urlId: string) => {
	const json = await fetch(`/agents/${urlId}/use-agent`, {
		method: "POST",
	}).then((res) => res.json());
	assertAgentState(json);
	return json;
};
export const useAgent = () => {
	const urlId = useAgentUrlId();
	const { data, mutate } = useSWR<InferResponse<typeof GET>>(
		`/agents/${urlId}/use-agent`,
		fetcher,
		{
			refreshInterval: (latestData) => {
				if (latestData?.agent.latestRun?.status === "success") {
					return 0;
				}
				return 1000;
			},
		},
	);
	const runAgent = () => {
		mutate(execApi(urlId), {
			optimisticData: {
				agent: {
					latestRun: {
						status: "creating",
						processes: [],
					},
				},
			},
		});
	};
	return { runAgent, runningAgent: data?.agent };
};
