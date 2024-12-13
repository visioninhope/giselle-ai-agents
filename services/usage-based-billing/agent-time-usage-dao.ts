import {
	agentActivities,
	agentTimeUsageReports,
	agents,
	type db as drizzleDb,
	subscriptions,
} from "@/drizzle";
import { and, desc, eq, gt, inArray, isNull, lte } from "drizzle-orm";
import type {
	AgentActivity,
	AgentTimeUsageDataAccess,
	AgentTimeUsageReport,
} from "./types";

export class AgentTimeUsageDAO implements AgentTimeUsageDataAccess {
	constructor(private readonly db: typeof drizzleDb) {}

	async transaction<T>(
		fn: (dao: AgentTimeUsageDataAccess) => Promise<T>,
	): Promise<T> {
		return await this.db.transaction(async (tx) => {
			const transactionDao = new AgentTimeUsageDAO(tx);
			return await fn(transactionDao);
		});
	}

	async fetchCurrentSubscription(teamDbId: number) {
		const records = await this.db
			.select({
				id: subscriptions.id,
				periodStart: subscriptions.currentPeriodStart,
				periodEnd: subscriptions.currentPeriodEnd,
			})
			.from(subscriptions)
			.where(
				and(
					eq(subscriptions.teamDbId, teamDbId),
					eq(subscriptions.status, "active"),
				),
			)
			.limit(1);
		if (records.length === 0) {
			throw new Error(`No active subscription found for team ${teamDbId}`);
		}
		if (records.length > 1) {
			throw new Error(
				`Multiple active subscriptions found for team ${teamDbId}`,
			);
		}
		const currentSubscription = records[0];
		return {
			subscriptionId: currentSubscription.id,
			periodStart: currentSubscription.periodStart,
			periodEnd: currentSubscription.periodEnd,
		};
	}

	async findUnprocessedActivities(
		teamDbId: number,
		periodStart: Date,
		periodEnd: Date,
	): Promise<AgentActivity[]> {
		const activities = await this.db
			.select({
				dbId: agentActivities.dbId,
				totalDurationMs: agentActivities.totalDurationMs,
				endedAt: agentActivities.endedAt,
				usageReportDbId: agentActivities.usageReportDbId,
			})
			.from(agentActivities)
			.innerJoin(agents, eq(agentActivities.agentDbId, agents.dbId))
			.where(
				and(
					eq(agents.teamDbId, teamDbId),
					isNull(agentActivities.usageReportDbId),
					gt(agentActivities.endedAt, periodStart),
					lte(agentActivities.endedAt, periodEnd),
				),
			)
			.orderBy(agentActivities.endedAt);

		return activities;
	}

	async findLastUsageReport(
		teamDbId: number,
		periodStart: Date,
	): Promise<AgentTimeUsageReport | null> {
		const reports = await this.db
			.select()
			.from(agentTimeUsageReports)
			.where(
				and(
					eq(agentTimeUsageReports.teamDbId, teamDbId),
					eq(agentTimeUsageReports.periodStart, periodStart),
				),
			)
			.orderBy(desc(agentTimeUsageReports.createdAt))
			.limit(1);

		return reports[0] || null;
	}

	async createUsageReport(params: {
		teamDbId: number;
		periodStart: Date;
		periodEnd: Date;
		accumulatedDurationMs: number;
		minutesIncrement: number;
		stripeMeterEventId: string;
	}): Promise<AgentTimeUsageReport> {
		const [report] = await this.db
			.insert(agentTimeUsageReports)
			.values({
				teamDbId: params.teamDbId,
				periodStart: params.periodStart,
				periodEnd: params.periodEnd,
				accumulatedDurationMs: params.accumulatedDurationMs,
				minutesIncrement: params.minutesIncrement,
				stripeMeterEventId: params.stripeMeterEventId,
			})
			.returning();
		return report;
	}

	async markActivitiesAsProcessed(
		activityIds: number[],
		usageReportId: number,
	): Promise<void> {
		if (activityIds.length === 0) {
			return;
		}

		await this.db
			.update(agentActivities)
			.set({
				usageReportDbId: usageReportId,
			})
			.where(inArray(agentActivities.dbId, activityIds));
	}
}
