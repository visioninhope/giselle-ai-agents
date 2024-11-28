import { z } from "zod";

const TokenConsumedSchema = z.object({
	tokenConsumed: z.number(), //Number of tokens consumed by the API request
	duration: z.number().min(0), // Time taken for text generation in milliseconds
});

export type TokenConsumedSchema = z.infer<typeof TokenConsumedSchema>;
