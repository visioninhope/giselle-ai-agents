import { logger } from "@/lib/logger";
import * as Sentry from "@sentry/nextjs";
import { GaxiosError } from "gaxios";
import { google } from "googleapis";

export function buildGoogleUserClient(token: GoogleUserCredential) {
	const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
	if (!clientId) {
		throw new Error("GOOGLE_OAUTH_CLIENT_ID is empty");
	}
	const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
	if (!clientSecret) {
		throw new Error("GOOGLE_OAUTH_CLIENT_SECRET is empty");
	}

	const loggerWithSentry = {
		error: (error: Error) => {
			if (process.env.NODE_ENV === "development") {
				console.error(error);
			}
			Sentry.captureException(error);
		},
		warning: (message: string) => {
			if (process.env.NODE_ENV === "development") {
				console.warn(message);
			}
			Sentry.captureMessage(message, "warning");
		},
		info: (message: string) => {
			console.info(message);
		},
	};

	return new GoogleUserClient(token, clientId, clientSecret, loggerWithSentry);
}

// MARK: Errors

class GoogleTokenRefreshError extends Error {
	constructor(message: string, options?: { cause?: unknown }) {
		super(message, options);
		this.name = this.constructor.name;
		Object.setPrototypeOf(this, GoogleTokenRefreshError.prototype);
	}
}

/**
 * Determines if the given error requires authorization.
 * if return value is true, the user should be redirected to the authorization page.
 *
 * see {@link https://supabase.com/docs/reference/javascript/auth-signinwithoauth}
 *
 * @param error - The error to check.
 * @returns True if the error requires authorization, false otherwise.
 */

export function needsAuthorization(error: unknown) {
	if (error instanceof GoogleTokenRefreshError) {
		return true;
	}
	logger.debug({ error }, "error------------");
	if (error instanceof GaxiosError) {
		return error.status === 401 || error.status === 403 || error.status === 404;
	}
	return false;
}

class GoogleUserClient {
	private clientId: string;
	private clientSecret: string;
	private logger: Logger;

	constructor(
		private token: GoogleUserCredential,
		clientId: string,
		clientSecret: string,
		logger: Logger,
	) {
		this.clientId = clientId;
		this.clientSecret = clientSecret;
		this.logger = logger;
	}

	async getUser() {
		try {
			logger.debug({ clientId: this.clientId }, "this.clientId");
			const authClient = await this.buildClient();
			logger.debug(
				{
					hasAccessToken: !!this.token.accessToken,
					tokenPrefix: this.token.accessToken?.substring(0, 5),
				},
				"getting user info",
			);

			const oauth2 = google.oauth2({
				version: "v2",
				auth: authClient,
			});
			logger.debug("oauth2 built");
			logger.debug(
				{
					userinfo: {
						methods: Object.getOwnPropertyNames(oauth2.userinfo),
						prototype: Object.getOwnPropertyNames(
							Object.getPrototypeOf(oauth2.userinfo),
						),
					},
				},
				"Detailed userinfo methods",
			);
			const { data } = await oauth2.userinfo.get();
			logger.debug({ data }, "userinfo.get() response");

			const user_data = {
				first_name: data.given_name,
				last_name: data.family_name,
				email: data.email,
			};

			logger.debug({ user_data }, "Processed user data");
			return user_data;
		} catch (error) {
			logger.error(
				{
					error,
					tokenState: {
						hasAccessToken: !!this.token.accessToken,
						hasRefreshToken: !!this.token.refreshToken,
					},
				},
				"Failed to get user info",
			);
			throw error;
		}
	}

	private async buildClient() {
		const client = new google.auth.OAuth2(this.clientId, this.clientSecret);

		client.setCredentials({
			access_token: this.token.accessToken,
			refresh_token: this.token.refreshToken ?? undefined,
		});

		logger.debug("auth client built");
		return client;
	}
}

type GoogleUserCredential = {
	accessToken: string;
	expiresAt: Date | null;
	refreshToken: string | null;
};

type Logger = {
	error: (error: Error) => void;
	warning: (message: string) => void;
	info: (message: string) => void;
};

export type { GoogleUserClient };
