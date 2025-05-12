// Model cost in USD
export type Cost = number;

/**
 * Base configuration for token-based pricing (flat rate)
 * Represents the simplest form of token pricing with a fixed cost per token
 */
export type BaseTokenPrice = {
	costPerMegaToken: Cost;
};

export type TokenBasedPricing = {
	input: BaseTokenPrice;
	output: BaseTokenPrice;
};

export type ModelPrice = {
	validFrom: string;
	price: TokenBasedPricing;
};
