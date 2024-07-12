import { assertAgentRequest } from "@/app/agents/models/agent-process";
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
	assertAgentRequest(agent);
	return { agent };
};
export const useRequest = () => {
	const urlId = useAgentUrlId();
	const { data, mutate } = useSWR<InferResponse<typeof GET>>(
		`/agents/${urlId}/use-request`,
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
	const sendRequest = () => {
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
	return { sendRequest, request: data };
};
