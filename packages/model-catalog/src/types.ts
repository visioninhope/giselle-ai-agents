import type { LLMProvider } from "@giselle-sdk/data-type";

export const Capability = {
	TextGeneration: 1 << 0,
	ImageGeneration: 1 << 1,
	Reasoning: 1 << 2,
	GenericFileInput: 1 << 3,
	PdfFileInput: 1 << 4,
	ImageFileInput: 1 << 5,
	SearchGrounding: 1 << 6,
} as const;

export const Tier = {
	Free: "free",
	Plus: "plus",
	Pro: "pro",
} as const;

export type Tier = (typeof Tier)[keyof typeof Tier];

export const TierAccess: Record<Tier, Tier[]> = {
	[Tier.Free]: [Tier.Free],
	[Tier.Plus]: [Tier.Free, Tier.Plus],
	[Tier.Pro]: [Tier.Free, Tier.Plus, Tier.Pro],
};

type Capabilities = number;

export interface Model {
	provider: LLMProvider;
	modelId: string;
	capabilities: Capabilities;
	tier: Tier;
	experimental?: boolean;
}
