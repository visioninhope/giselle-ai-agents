import { createId } from "@paralleldrive/cuid2";
import type Stripe from "stripe";
import type { AgentTimeUsageDataAccess } from "./types";

const AGENT_TIME_USAGE_METER_NAME = "agent_time_charge";

/**
 * Pure function for calculating usage time
 */
export function calculateAgentTimeUsage(
	activities: { totalDurationMs: number }[],
	lastReport: {
		accumulatedDurationMs: number;
	} | null,
) {
	// Total duration of new activities (milliseconds)
	const newDurationMs = activities.reduce(
		(sum, activity) => sum + activity.totalDurationMs,
		0,
	);

	// Add new duration to the accumulated duration
	const accumulatedDurationMs =
		(lastReport?.accumulatedDurationMs ?? 0) + newDurationMs;

	// Convert milliseconds to minutes (round down)
	// If accumulatedDurationMs will over Number.MAX_SAFE_INTEGER, we should use Bigint but, we may not need to worry about it
	// Number.MAX_SAFE_INTEGER = 9007199254740991 = 104,249,991 days
	const totalMinutes = Math.floor(accumulatedDurationMs / 1000 / 60);

	const lastReportedTotalMinutes = Math.floor(
		(lastReport?.accumulatedDurationMs ?? 0) / 1000 / 60,
	);
	const minutesIncrement = totalMinutes - lastReportedTotalMinutes;

	return {
		accumulatedDurationMs,
		minutesIncrement,
	};
}

/**
 * Function to process unreported agent usage time for current period
 */
export async function processUnreportedActivities(
	params: {
		teamDbId: number;
	},
	deps: {
		dao: AgentTimeUsageDataAccess;
		stripe: Stripe;
	},
) {
	const { dao, stripe } = deps;
	const { subscriptionId, periodStart, periodEnd } =
		await dao.fetchCurrentSubscription(params.teamDbId);
	// FIXME: if we have customer id in subscriptions table, we can use it directly
	const subscription = await stripe.subscriptions.retrieve(subscriptionId);
	const customerId =
		typeof subscription.customer === "string"
			? subscription.customer
			: subscription.customer.id;

	return await dao.transaction(async (tx) => {
		// Retrieve unprocessed activities
		const unprocessedActivities = await tx.findUnprocessedActivities(
			params.teamDbId,
			periodStart,
			periodEnd,
		);

		if (unprocessedActivities.length === 0) {
			return { processedReportId: null };
		}

		// Retrieve the latest report
		const lastReport = await tx.findLastUsageReport(
			params.teamDbId,
			periodStart,
		);

		// Calculate usage time
		const { accumulatedDurationMs, minutesIncrement } = calculateAgentTimeUsage(
			unprocessedActivities,
			lastReport,
		);

		// Do not report if the increment is less than 1 minute
		if (minutesIncrement < 1) {
			return { processedReportId: null };
		}

		const meterEventId = createId();
		const currentTimestamp = new Date().toISOString();

		// Report usage to Stripe
		const stripeEvent = await stripe.v2.billing.meterEvents.create({
			event_name: AGENT_TIME_USAGE_METER_NAME,
			payload: {
				value: minutesIncrement.toString(),
				stripe_customer_id: customerId,
			},
			identifier: meterEventId,
			timestamp: currentTimestamp,
		});

		// Create usage report
		const report = await tx.createUsageReport({
			teamDbId: params.teamDbId,
			periodStart,
			periodEnd,
			accumulatedDurationMs,
			minutesIncrement,
			stripeMeterEventId: stripeEvent.identifier,
		});

		// Update activities
		await tx.markActivitiesAsProcessed(
			unprocessedActivities.map((a) => a.dbId),
			report.dbId,
		);

		return { processedReportId: report.dbId };
	});
}
