import { z } from "zod";

const TokenConsumedSchema = z.object({
	tokenConsumed: z.number(), //Number of tokens consumed by the API request
	duration: z.number().min(0), // Time taken for text generation in milliseconds
	measurementScope: z.number(), // ID of the plan usage contract to which the requester belongs
	isR06User: z.boolean(), // Whether the requester has internal user
});

export type TokenConsumedSchema = z.infer<typeof TokenConsumedSchema>;
