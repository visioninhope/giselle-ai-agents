import type { BaseTokenPrice, Cost, TokenBasedPricing } from "./pricing";
import { tokensToMegaTokens } from "./pricing";
import type { ModelTokenUsage, ModelUsage } from "./usage";

export interface CostResult {
	input: Cost;
	output: Cost;
	total: Cost;
}

/**
 * Base interface for tool configurations
 * All provider-specific configurations should extend this interface
 * and be defined in their respective provider files.
 */
export interface CostCalculator<TUsage extends ModelUsage = ModelTokenUsage> {
	calculate(model: string, usage: TUsage): Promise<CostResult>;
}

export class DefaultCostCalculator implements CostCalculator {
	constructor(private provider: string) {}

	async calculate(model: string, usage: ModelUsage): Promise<CostResult> {
		console.log(`No cost calculator found for ${this.provider}`);
		return { input: 0, output: 0, total: 0 };
	}
}

export function calculateTokenCost(
	tokens: number,
	pricing: BaseTokenPrice,
): Cost {
	return tokensToMegaTokens(tokens) * pricing.costPerMegaToken;
}
