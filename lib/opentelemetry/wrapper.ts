import { getCurrentMeasurementScope, isRoute06User } from "@/app/(auth)/lib";
import { createLogger } from "./log";
import type { ExternalServiceName, RequestCountSchema } from "./types";

export async function withMeasurement<T>(
	operation: () => Promise<T>,
	externalServiceName: ExternalServiceName,
) {
	const logger = createLogger(externalServiceName);
	const startTime = performance.now();

	try {
		const result = await operation();
		const duration = performance.now() - startTime;

		Promise.all([getCurrentMeasurementScope(), isRoute06User()])
			.then(([measurementScope, isR06User]) => {
				const metrics: RequestCountSchema = {
					externalServiceName,
					requestCount: 1,
					duration,
					measurementScope,
					isR06User,
				};

				logger.info(metrics, `[${externalServiceName}] response obtained`);
			})
			.catch((error) => {
				logger.error(error, "failed to get user info for logging");
			});

		return result;
	} catch (error) {
		if (error instanceof Error) {
			logger.error(error, `[${externalServiceName}] operation failed`);
		} else {
			logger.error(
				new Error("Unknown error occurred"),
				`[${externalServiceName}] operation failed`,
			);
		}
		throw error;
	}
}
