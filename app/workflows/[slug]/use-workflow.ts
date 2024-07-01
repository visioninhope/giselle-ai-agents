import { useCallback, useState } from "react";
import type { Run } from "./run";

export const useWorkflow = () => {
	const [latestRun, setLatestRun] = useState<Run | null>(null);
	const run = useCallback(() => {
		setLatestRun({
			steps: [
				{
					id: "find-user",
					title: "Find User",
					time: "1s",
					status: "running",
				},
				{
					id: "send-mail",
					title: "Send Mail",
					status: "idle",
				},
			],
		});
	}, []);
	return {
		run,
		latestRun,
	};
};
