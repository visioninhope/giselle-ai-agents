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

export async function reportUserSeatUsage(
	subscriptionId: string,
	customerId: string,
) {
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
	const stripeEvent = await stripe.v2.billing.meterEvents.create({
		event_name: USER_SEAT_METER_NAME,
		payload: {
			value: currentMemberCount.toString(),
			stripe_customer_id: customerId,
		},
		identifier: meterEventId,
		timestamp: timestamp.toISOString(),
	});

	// Save report to the database
	await saveUserSeatUsage(
		stripeEvent.identifier,
		teamDbId,
		timestamp,
		teamMembers,
	);
}

async function reportDeltaUserSeatUsage(
	teamDbId: number,
	customerId: string,
	lastReport: typeof userSeatUsageReports.$inferSelect,
) {
	const teamMembers = await listTeamMembers(teamDbId);
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
	await saveUserSeatUsage(
		stripeEvent.identifier,
		teamDbId,
		timestamp,
		teamMembers,
	);
}

async function saveUserSeatUsage(
	stripeMeterEventId: string,
	teamDbId: number,
	timestamp: Date,
	teamMembers: number[],
) {
	await db.insert(userSeatUsageReports).values({
		stripeMeterEventId,
		teamDbId,
		timestamp,
		userDbIdList: teamMembers,
	});
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
