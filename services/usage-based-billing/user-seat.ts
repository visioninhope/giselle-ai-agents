import {
	db,
	subscriptions,
	teamMemberships,
	userSeatUsageReports,
} from "@/drizzle";
import { toUTCDate } from "@/lib/date";
import { createId } from "@paralleldrive/cuid2";
import { and, desc, eq, gte, lt } from "drizzle-orm";
import { stripe } from "../external/stripe";

const USER_SEAT_METER_NAME = "user_seat";

/**
 * Reports user seat usage to Stripe's metering system for usage-based billing.
 * This function handles both initial reporting and delta-based updates of user seat usage.
 *
 * The function first checks if there's an existing usage report for the current billing period.
 * If no report exists, it creates a new report with the current total number of seats.
 * If a report exists, it calculates and reports the delta (change) in seat usage. If members are not changed, it will not report.
 *
 * @param subscriptionId - The Stripe subscription ID to report usage for
 * @param customerId - The Stripe customer ID associated with the subscription
 * @throws {Error} When the subscription is not found
 * @returns {Promise<void>} A promise that resolves when the usage has been reported
 */
export async function reportUserSeatUsage(
	subscriptionId: string,
	customerId: string,
): Promise<void> {
	const subscriptionRecord = await findSubscription(subscriptionId);
	const teamDbId = subscriptionRecord.teamDbId;
	const periodStart = subscriptionRecord.currentPeriodStart;
	const periodEnd = subscriptionRecord.currentPeriodEnd;

	const lastReport = await db
		.select()
		.from(userSeatUsageReports)
		.where(
			and(
				eq(userSeatUsageReports.teamDbId, teamDbId),
				gte(userSeatUsageReports.timestamp, periodStart),
				lt(userSeatUsageReports.timestamp, periodEnd),
			),
		)
		.orderBy(desc(userSeatUsageReports.timestamp))
		.limit(1);

	// If record is not exists, we will report the current count
	if (lastReport.length === 0) {
		await reportCurrentUserSeatUsage(teamDbId, customerId);
		return;
	}

	// If record is exists in the database, we will report delta
	await reportDeltaUserSeatUsage(teamDbId, customerId, lastReport[0]);
}

async function reportCurrentUserSeatUsage(
	teamDbId: number,
	customerId: string,
) {
	const teamMembers = await listTeamMembers(teamDbId);
	const currentMemberCount = teamMembers.length;
	const meterEventId = createId();

	const timestamp = toUTCDate(new Date());
	const value = currentMemberCount;
	const stripeEvent = await stripe.v2.billing.meterEvents.create({
		event_name: USER_SEAT_METER_NAME,
		payload: {
			value: value.toString(),
			stripe_customer_id: customerId,
		},
		identifier: meterEventId,
		timestamp: timestamp.toISOString(),
	});

	// Save report to the database
	await saveUserSeatUsage({
		stripeMeterEventId: stripeEvent.identifier,
		teamDbId,
		timestamp,
		userDbIdList: teamMembers,
		value,
		isDelta: false,
	});
}

async function reportDeltaUserSeatUsage(
	teamDbId: number,
	customerId: string,
	lastReport: typeof userSeatUsageReports.$inferSelect,
) {
	const teamMembers = await listTeamMembers(teamDbId);
	if (areNumberArraysEqualWithEvery(teamMembers, lastReport.userDbIdList)) {
		// No change in the team members
		return;
	}
	const delta = teamMembers.length - lastReport.userDbIdList.length;
	const meterEventId = createId();

	const timestamp = toUTCDate(new Date());
	const stripeEvent = await stripe.v2.billing.meterEvents.create({
		event_name: USER_SEAT_METER_NAME,
		payload: {
			value: delta.toString(),
			stripe_customer_id: customerId,
		},
		identifier: meterEventId,
		timestamp: timestamp.toISOString(),
	});

	// Save report to the database
	await saveUserSeatUsage({
		stripeMeterEventId: stripeEvent.identifier,
		teamDbId,
		timestamp,
		userDbIdList: teamMembers,
		value: delta,
		isDelta: true,
	});
}

async function saveUserSeatUsage(params: {
	stripeMeterEventId: string;
	teamDbId: number;
	timestamp: Date;
	userDbIdList: number[];
	value: number;
	isDelta: boolean;
}) {
	await db.insert(userSeatUsageReports).values(params);
}

async function findSubscription(subscriptionId: string) {
	const record = await db
		.select({
			dbid: subscriptions.dbId,
			teamDbId: subscriptions.teamDbId,
			currentPeriodEnd: subscriptions.currentPeriodEnd,
			currentPeriodStart: subscriptions.currentPeriodStart,
		})
		.from(subscriptions)
		.where(eq(subscriptions.id, subscriptionId));
	if (record.length === 0) {
		throw new Error(`Subscription not found: ${subscriptionId}`);
	}
	return record[0];
}

async function listTeamMembers(teamDbId: number) {
	const teamMembers = await db
		.select({ userDbId: teamMemberships.userDbId })
		.from(teamMemberships)
		.where(eq(teamMemberships.teamDbId, teamDbId));
	return teamMembers.map((member) => member.userDbId);
}

function areNumberArraysEqualWithEvery(
	arr1: number[],
	arr2: number[],
): boolean {
	if (arr1.length !== arr2.length) {
		return false;
	}
	return arr1.every((value, index) => value === arr2[index]);
}
