import { Tier } from "@giselle-sdk/language-model";
import { z } from "zod";

const Subscription = z.object({
	planName: z.string(),
	currentPeriodEndDate: z.date(),
	languageModelTier: Tier,
	isExpiring: z.boolean(),
	agentTime: z.object({
		limit: z.number(),
		used: z.number(),
	}),
	detailPath: z.string().optional(),
});

export type Subscription = z.infer<typeof Subscription>;
