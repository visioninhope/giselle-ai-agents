export const StepStatus = {
	idle: "idle",
	running: "running",
	success: "success",
	failed: "failure",
} as const;
type BaseStep = {
	id: string;
	title: string;
};
type IdleStep = BaseStep & {
	status: typeof StepStatus.idle;
};
type RunningStep = BaseStep & {
	status: typeof StepStatus.running;
	time: string;
};
type SuccessStep = BaseStep & {
	status: typeof StepStatus.success;
	time: string;
};
export type Step = IdleStep | RunningStep | SuccessStep;
export type Run = {
	steps: Step[];
};
