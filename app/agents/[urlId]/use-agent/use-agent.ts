import { assertAgentProcess } from "@/app/agents/models/agent-process";
import type { InferResponse } from "@/lib/api";
import { fetcher } from "@/lib/fetcher";
import useSWR from "swr";
import invariant from "tiny-invariant";
import { useAgentUrlId } from "../use-agent-url-id";
import type { GET } from "./route";

const execApi = async (urlId: string) => {
	const agent = await fetch(`/agents/${urlId}/use-agent`, {
		method: "POST",
	}).then((res) => res.json());
	assertAgentProcess(agent);
	return { agent };
};
export const useAgent = () => {
	const urlId = useAgentUrlId();
	const { data, mutate } = useSWR<InferResponse<typeof GET>>(
		`/agents/${urlId}/use-agent`,
		fetcher,
		{
			refreshInterval: (latestData) => {
				if (
					latestData == null ||
					latestData.run == null ||
					latestData.run.status === "success"
				) {
					return 0;
				}
				return 1000;
			},
		},
	);
	const runAgent = () => {
		mutate(
			execApi(urlId).then(({ agent }) => agent),
			{
				optimisticData: (prev) => {
					invariant(prev != null, "Previous data is missing");
					return {
						agent: {
							...prev.agent,
						},
						status: "creating",
						run: null,
					};
				},
			},
		);
	};
	return { runAgent, runningAgent: data };
};
