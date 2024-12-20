/**
 * Cron job handler for daily sales summary.
 *
 * Target date is optional
 * - default: yeserday
 * - format: YYYY-MM-DD
 * - timezone: handled as UTC
 *
 * @example
 * curl http://localhost:3000/api/cron/daily-sales-summary
 * curl http://localhost:3000/api/cron/daily-sales-summary?targetDate=2022-01-01
 */
import { captureException } from "@sentry/nextjs";
import type { NextRequest } from "next/server";
import { processDailySalesSummary } from "./process-daily-sales-summary";

export async function GET(req: NextRequest) {
	// TODO: check authorization header
	const params = req.nextUrl.searchParams;
	const targetDate = parseTargetDateParam(params.get("targetDate"));

	console.log("Daily sales summary cron job started");
	console.log("Target date:", targetDate.toISOString());
	try {
		await processDailySalesSummary(targetDate);
	} catch (error: unknown) {
		console.error("Daily sales summary cron job failed:", error);
		captureException(error);
		return new Response("Internal Server Error", { status: 500 });
	}

	console.log("Daily sales summary cron job completed");
	return new Response("ok", { status: 200 });
}

/**
 * Convert string or null date to UTC date
 * if date is not provided, return yesterday's date
 *
 * @param dateString - Date string in YYYY-MM-DD format (optional)
 * @returns Date object set to 00:00:00 UTC
 */
function parseTargetDateParam(dateString: string | null): Date {
	try {
		if (dateString != null) {
			// Validate input format
			if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
				throw new Error("Invalid date format. Expected: YYYY-MM-DD");
			}
			return new Date(
				Date.UTC(
					Number(dateString.slice(0, 4)),
					Number(dateString.slice(5, 7)) - 1,
					Number(dateString.slice(8, 10)),
				),
			);
		}

		// Return yesterday's date
		const now = new Date();
		return new Date(
			Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1),
		);
	} catch (error) {
		console.error("Date parsing error:", error);
		throw error;
	}
}
