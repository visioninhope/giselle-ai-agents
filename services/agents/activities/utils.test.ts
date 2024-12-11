import { afterAll, describe, expect, test } from "bun:test";
import { getMonthlyBillingCycle } from "./utils";

describe("getMonthlyBillingCycle", () => {
	test("preserve exact times", () => {
		const referenceDate = new Date("2024-12-15T13:00:15Z");
		const currentDate = new Date("2024-12-20T14:00:00Z");

		const { start, end } = getMonthlyBillingCycle(referenceDate, currentDate);

		expect(start.getTime()).toBe(new Date("2024-12-15T13:00:15Z").getTime());
		expect(end.getTime()).toBe(new Date("2025-01-15T13:00:15Z").getTime());
	});

	test("reference time is older than 2 month ago", () => {
		const referenceDate = new Date("2024-09-15T13:00:15Z");
		const currentDate = new Date("2024-12-20T14:00:00Z");

		const { start, end } = getMonthlyBillingCycle(referenceDate, currentDate);

		expect(start.getTime()).toBe(new Date("2024-12-15T13:00:15Z").getTime());
		expect(end.getTime()).toBe(new Date("2025-01-15T13:00:15Z").getTime());
	});

	test("handle end-of-month", () => {
		const referenceDate = new Date("2024-01-31T22:30:45Z");
		const currentDate = new Date("2024-02-15T10:00:00Z");

		const { start, end } = getMonthlyBillingCycle(referenceDate, currentDate);

		expect(start.getTime()).toBe(new Date("2024-01-31T22:30:45Z").getTime());
		expect(end.getTime()).toBe(new Date("2024-02-29T22:30:45Z").getTime());
	});

	test("exact one-month span", () => {
		const referenceDate = new Date("2023-03-15T09:15:00Z");
		const currentDate = new Date("2023-03-20T12:00:00Z");

		const { start, end } = getMonthlyBillingCycle(referenceDate, currentDate);

		expect(start.getTime()).toBe(new Date("2023-03-15T09:15:00Z").getTime());
		expect(end.getTime()).toBe(new Date("2023-04-15T09:15:00Z").getTime());
	});

	test("before the first full billing cycle completes", () => {
		const referenceDate = new Date("2024-07-10T05:00:00Z");
		const currentDate = new Date("2024-07-10T06:00:00Z");

		const { start, end } = getMonthlyBillingCycle(referenceDate, currentDate);

		expect(start.getTime()).toBe(new Date("2024-07-10T05:00:00Z").getTime());
		expect(end.getTime()).toBe(new Date("2024-08-10T05:00:00Z").getTime());
	});

	test("handle JST timezone input", () => {
		const referenceDate = new Date("2024-01-15T15:00:00Z");
		const currentDate = new Date("2024-01-16T00:00:00+09:00"); // JST

		const { start, end } = getMonthlyBillingCycle(referenceDate, currentDate);
		expect(start.getTime()).toBe(new Date("2024-01-15T15:00:00Z").getTime());
		expect(end.getTime()).toBe(new Date("2024-02-15T15:00:00Z").getTime());
	});

	test("handle JST timezone input crossing date boundary", () => {
		const referenceDate = new Date("2024-01-31T15:00:00Z");
		const currentDate = new Date("2024-02-01T00:00:00+09:00"); // JST

		const { start, end } = getMonthlyBillingCycle(referenceDate, currentDate);
		expect(start.getTime()).toBe(new Date("2024-01-31T15:00:00Z").getTime());
		expect(end.getTime()).toBe(new Date("2024-02-29T15:00:00Z").getTime());
	});

	test("handle different timezone input (e.g., PST)", () => {
		const referenceDate = new Date("2024-01-15T15:00:00Z");
		const currentDate = new Date("2024-01-15T07:00:00-08:00"); // PST

		const { start, end } = getMonthlyBillingCycle(referenceDate, currentDate);
		expect(start.getTime()).toBe(new Date("2024-01-15T15:00:00Z").getTime());
		expect(end.getTime()).toBe(new Date("2024-02-15T15:00:00Z").getTime());
	});

	test("handle daylight saving time transition", () => {
		const referenceDate = new Date("2024-03-10T15:00:00Z");
		const currentDate = new Date("2024-03-10T07:00:00-07:00"); // PDT

		const { start, end } = getMonthlyBillingCycle(referenceDate, currentDate);
		expect(start.getTime()).toBe(new Date("2024-02-10T15:00:00Z").getTime());
		expect(end.getTime()).toBe(new Date("2024-03-10T15:00:00Z").getTime());
	});

	test("handle month end cases", () => {
		const referenceDate = new Date("2024-01-31T15:00:00Z");
		const currentDate = new Date("2024-04-15T15:00:00Z");

		const { start, end } = getMonthlyBillingCycle(referenceDate, currentDate);
		expect(start.getTime()).toBe(new Date("2024-03-31T15:00:00Z").getTime());
		expect(end.getTime()).toBe(new Date("2024-04-30T15:00:00Z").getTime());
	});
});

describe("getMonthlyBillingCycle environment independence", () => {
	const originalTZ = process.env.TZ;

	const testCases = [
		{ tz: "Asia/Tokyo", name: "JST" },
		{ tz: "America/New_York", name: "EST" },
		{ tz: "UTC", name: "UTC" },
		{ tz: "Europe/London", name: "GMT" },
	];

	afterAll(() => {
		process.env.TZ = originalTZ;
	});

	for (const { tz, name } of testCases) {
		test(`should produce same results in ${name}`, () => {
			process.env.TZ = tz;

			const referenceDate = new Date("2024-01-15T15:00:00Z");
			const currentDate = new Date("2024-02-01T00:00:00+09:00");

			const { start, end } = getMonthlyBillingCycle(referenceDate, currentDate);

			expect(start.toISOString()).toBe("2024-01-15T15:00:00.000Z");
			expect(end.toISOString()).toBe("2024-02-15T15:00:00.000Z");
		});
	}

	test("should handle DST transitions in America/Los_Angeles after DST has started", () => {
		process.env.TZ = "America/Los_Angeles";

		// referenceDate: 2024-02-15T15:00:00Z (before DST starts)
		const referenceDate = new Date("2024-02-15T15:00:00Z");

		// currentDate: 2024-03-15T08:00:00-07:00
		// On March 15, 2024, LA is under DST (PDT, UTC-7).
		// 08:00 PDT corresponds to 15:00 UTC, making it exactly one month apart from referenceDate.
		const currentDate = new Date("2024-03-15T08:00:00-07:00");

		const { start, end } = getMonthlyBillingCycle(referenceDate, currentDate);

		expect(start.toISOString()).toBe("2024-03-15T15:00:00.000Z");
		expect(end.toISOString()).toBe("2024-04-15T15:00:00.000Z");
	});
});
