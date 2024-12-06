import type { AgentId } from "../types";

export class AgentActivities {
	private actions: AgentActivityAction[] = [];

	constructor(public agentId: AgentId) {}

	collectAction(action: string, startedAt: Date, completedAt: Date) {
		const record = new AgentActivityAction(action, startedAt, completedAt);
		this.actions.push(record);
	}

	totalDurationMs() {
		return this.actions.reduce((acc, action) => acc + action.durationMs, 0);
	}
}

export class AgentActivityAction {
	constructor(
		public action: string,
		public startedAt: Date,
		public completedAt: Date,
	) {}

	get durationMs() {
		return this.completedAt.getTime() - this.startedAt.getTime();
	}
}
