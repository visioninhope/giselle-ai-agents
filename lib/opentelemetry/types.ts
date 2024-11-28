import { z } from "zod";

const BaseMetricsSchema = z.object({
	duration: z.number().min(0), // Time taken for text generation in milliseconds
	measurementScope: z.number(), // ID of the plan usage contract to which the requester belongs
	isR06User: z.boolean(), // Whether the requester has internal user
});

const TokenConsumedSchema = BaseMetricsSchema.extend({
	tokenConsumed: z.number(), // Number of tokens consumed by the API request
});

const RequestCountSchema = BaseMetricsSchema.extend({
	requestCount: z.number(), // Number of requests called
});

export type TokenConsumedSchema = z.infer<typeof TokenConsumedSchema>;
export type RequestCountSchema = z.infer<typeof RequestCountSchema>;
