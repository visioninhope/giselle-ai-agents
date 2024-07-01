import type { Step } from "./runner";

export const useWorkflowRunner = () => {
	return {
		start: () => {},
		run: {
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
					time: "1s",
					status: "idle",
				},
			] satisfies Step[],
		},
	};
};
