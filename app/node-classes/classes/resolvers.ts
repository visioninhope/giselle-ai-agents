import type { Resolver } from "../type";
import { resolver as text } from "./text/resolver";

/** @todo write document about naming convention */
export const resolvers: Record<string, Resolver> = {
	text,
};
