import { type Model, type Tier, TierAccess } from "./types";

export function hasCapability(model: Model, capability: number): boolean {
	return (model.capabilities & capability) === capability;
}

export function hasTierAccess(model: Model, tier: Tier): boolean {
	return TierAccess[model.tier].includes(tier);
}
