export const StepStatus = ["idle", "running", "success", "failure"] as const;
export type Step = {
	id: string;
	title: string;
	time: string;
	status: (typeof StepStatus)[number];
};
