import { expect, test } from "@playwright/test";

function escapeRegExp(string: string): string {
	return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

test.describe("Login redirect functionality", () => {
	const baseUrl = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

	test("Should redirect unauthenticated user to login with returnUrl", async ({
		page,
		context,
	}) => {
		// Clear authentication state
		await context.clearCookies();

		// Try to access a protected page
		const protectedPath = "/settings/team";
		await page.goto(`${baseUrl}${protectedPath}`);

		// Should be redirected to login page with returnUrl parameter
		await expect(page).toHaveURL(
			`${baseUrl}/login?returnUrl=${encodeURIComponent(protectedPath)}`,
			{ timeout: 15000 },
		);

		// Verify the returnUrl parameter is preserved
		const url = new URL(page.url());
		expect(url.searchParams.get("returnUrl")).toBe(protectedPath);
	});

	test("Should redirect to returnUrl after successful login", async ({
		page,
		context,
	}) => {
		// Clear authentication state
		await context.clearCookies();

		// Try to access a protected page with query parameters
		const protectedPath = "/settings/team?foo=bar&baz=qux";
		await page.goto(`${baseUrl}${protectedPath}`);

		// Should be redirected to login page with returnUrl parameter
		// Note: The original query parameters are preserved in the login URL
		await expect(page).toHaveURL(
			new RegExp(`${escapeRegExp(baseUrl)}/login.*returnUrl=`),
			{
				timeout: 15000,
			},
		);

		// Verify the returnUrl parameter contains the full original path
		const url = new URL(page.url());
		const returnUrl = url.searchParams.get("returnUrl");
		expect(returnUrl).toBe(protectedPath);

		// Login with test credentials
		const loginEmail = process.env.PLAYWRIGHT_LOGIN_EMAIL;
		const loginPassword = process.env.PLAYWRIGHT_LOGIN_PASSWORD;

		if (!loginEmail || !loginPassword) {
			throw new Error(
				"PLAYWRIGHT_LOGIN_EMAIL and PLAYWRIGHT_LOGIN_PASSWORD must be set in environment variables.",
			);
		}

		await page.getByRole("textbox", { name: "Email" }).fill(loginEmail);
		await page.getByRole("textbox", { name: "Password" }).fill(loginPassword);

		// Click login and wait for redirect to the original protected page
		await Promise.all([
			page.waitForURL(`${baseUrl}${protectedPath}`, { timeout: 15000 }),
			page.getByRole("button", { name: "Log in" }).click(),
		]);
	});

	test.describe("Should prevent open redirect attacks", () => {
		const maliciousUrls = [
			{ url: "//example.com", description: "protocol-relative URL" },
			{ url: "/\\example.com", description: "backslash confusion" },
			{ url: "http://example.com", description: "absolute HTTP URL" },
			{ url: "https://example.com", description: "absolute HTTPS URL" },
			{ url: "javascript:alert('xss')", description: "JavaScript protocol" },
		];

		for (const { url: maliciousUrl, description } of maliciousUrls) {
			test(`Should block ${description}: ${maliciousUrl}`, async ({
				page,
				context,
			}) => {
				// Clear authentication state
				await context.clearCookies();

				// Navigate to login with malicious returnUrl
				await page.goto(
					`${baseUrl}/login?returnUrl=${encodeURIComponent(maliciousUrl)}`,
				);

				// Login with test credentials
				const loginEmail = process.env.PLAYWRIGHT_LOGIN_EMAIL;
				const loginPassword = process.env.PLAYWRIGHT_LOGIN_PASSWORD;

				if (!loginEmail || !loginPassword) {
					throw new Error(
						"PLAYWRIGHT_LOGIN_EMAIL and PLAYWRIGHT_LOGIN_PASSWORD must be set in environment variables.",
					);
				}

				await page.getByRole("textbox", { name: "Email" }).fill(loginEmail);
				await page
					.getByRole("textbox", { name: "Password" })
					.fill(loginPassword);

				// Click login and wait for redirect (should go to /apps instead of malicious URL)
				await Promise.all([
					page.waitForURL(`${baseUrl}/apps`, { timeout: 15000 }),
					page.getByRole("button", { name: "Log in" }).click(),
				]);
			});
		}
	});

	test("Should handle returnUrl with nested paths", async ({
		page,
		context,
	}) => {
		// Clear authentication state
		await context.clearCookies();

		// Try to access a nested protected page
		const nestedPath = "/settings/team/members/123?foo=bar&test=e2e";
		await page.goto(`${baseUrl}${nestedPath}`);

		// Should be redirected to login page with returnUrl parameter
		await expect(page).toHaveURL(
			new RegExp(`${escapeRegExp(baseUrl)}/login.*returnUrl=`),
			{
				timeout: 15000,
			},
		);

		// Verify the full path is preserved in returnUrl
		const url = new URL(page.url());
		expect(decodeURIComponent(url.searchParams.get("returnUrl") || "")).toBe(
			nestedPath,
		);
	});
});
