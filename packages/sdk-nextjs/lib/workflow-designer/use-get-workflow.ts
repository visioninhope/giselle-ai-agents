"use client";

import useSWR from "swr";
import type { WorkflowId } from "../workflow-data";
import { Output } from "../workflow-engine/core/handlers/get-workflow";

export function useGetWorkflow({
	workflowId,
	api = "/api/workflow/get-workflow",
}: {
	workflowId: WorkflowId;
	api?: string;
}) {
	const { isLoading, data } = useSWR([workflowId, "get-workflow"], () =>
		fetch(api, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ workflowId }),
		})
			.then((res) => res.json())
			.then((data) => Output.parse(data)),
	);
	return {
		isLoading,
		data,
	};
}
