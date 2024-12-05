import { getCurrentMeasurementScope, isRoute06User } from "@/app/(auth)/lib";
import { captureError } from "./log";
import type {
	ExternalServiceName,
	OtelLoggerWrapper,
	RequestCountSchema,
} from "./types";

export async function withMeasurement<T>(
	logger: OtelLoggerWrapper,
	operation: () => Promise<T>,
	externalServiceName: ExternalServiceName,
): Promise<T> {
	const startTime = performance.now();

	try {
		// business logic: error should be thrown
		const result = await operation();

		try {
			// instrumentation: error must not be thrown to avoid interfering with the business logic
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
				.catch((getMetricsTagError) => {
					captureError(
						logger,
						getMetricsTagError,
						"failed to get user info for logging",
					);
				});
		} catch (instrumentationError) {
			captureError(logger, instrumentationError, "instrumentation failed");
		}

		return result;
	} catch (error) {
		captureError(logger, error, `[${externalServiceName}] operation failed`);
		throw error;
	}
}
