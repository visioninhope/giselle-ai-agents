export type TokenUsage = {
	promptTokens: number;
	completionTokens: number;
	totalTokens: number;
};

export type ModelUsage = TokenUsage;
