// Based on next-auth
// https://github.com/nextauthjs/next-auth/blob/e62a6347572a2769bdd7a328c435d61ec631d3fe/packages/next-auth/src/lib/types.ts
import type { NextRequest } from "next/server";

/**
 * AppRouteHandlerFnContext is the context that is passed to the handler as the
 * second argument.
 */
export type AppRouteHandlerFnContext = {
	params: Promise<Record<string, string | string[]>>;
};
/**
 * Handler function for app routes. If a non-Response value is returned, an error
 * will be thrown.
 */
export type AppRouteHandlerFn = (
	/**
	 * Incoming request object.
	 */
	req: NextRequest,
	/**
	 * Context properties on the request (including the parameters if this was a
	 * dynamic route).
	 */
	ctx: AppRouteHandlerFnContext,
) => void | Response | Promise<Response> | Promise<void>;
