import { getCurrentMeasurementScope, isRoute06User } from "@/app/(auth)/lib";
import { createLogger } from "./log";
import type { RequestCountSchema, ExternalServiceName } from "./types";

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

				logger.info(metrics, `${externalServiceName} completed`);
			})
			.catch((error) => {
				logger.error(
					{
						duration,
						error,
					},
					"Failed to get user info for logging",
				);
			});

		return result;
	} catch (error) {
		const duration = performance.now() - startTime;
		logger.error(
			{
				duration,
				error,
			},
			"Operation failed",
		);
		throw error;
	}
}
