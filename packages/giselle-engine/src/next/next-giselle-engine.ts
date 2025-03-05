import { GiselleEngine, type GiselleEngineConfig } from "../core";
import { type RouterHandlers, createRouters, isRouterPath } from "../http";

interface NextGiselleEngineConfig extends GiselleEngineConfig {
	basePath: string;
}

async function getBody(
	req: Request,
): Promise<Record<string, unknown> | undefined> {
	if (!("body" in req) || !req.body || req.method !== "POST") return;

	const contentType = req.headers.get("content-type");
	if (contentType?.includes("application/json")) {
		const text = await req.text();
		if (text.length === 0) return;
		return JSON.parse(text);
	}
	if (contentType?.includes("application/x-www-form-urlencoded")) {
		const params = new URLSearchParams(await req.text());
		return Object.fromEntries(params);
	}
	if (contentType?.includes("multipart/form-data")) {
		const formData = await req.formData();
		const data = Object.fromEntries(formData.entries());
		return data;
	}
}

function createHttpHandler({
	giselleEngine,
	basePath,
}: {
	giselleEngine: GiselleEngine;
	basePath: NextGiselleEngineConfig["basePath"];
}) {
	// Create the router using a for...of loop
	const router: RouterHandlers = {} as RouterHandlers;

	for (const [path, createRoute] of Object.entries(createRouters)) {
		if (isRouterPath(path)) {
			// @ts-expect-error
			router[path] = createRoute(giselleEngine);
		}
	}

	return async function httpHandler(request: Request) {
		const url = new URL(request.url);
		const pathname = url.pathname;
		const a = url.pathname.match(new RegExp(`^${basePath}(.+)`));

		const segmentString = a?.at(-1);
		if (segmentString == null)
			throw new Error(`Cannot parse action at ${pathname}`);
		const segments = segmentString
			.replace(/^\//, "")
			.split("/")
			.filter(Boolean);

		if (segments.length !== 1) {
			throw new Error(`Invalid action at ${pathname}`);
		}

		const [routerPath] = segments;

		if (!isRouterPath(routerPath)) {
			throw new Error(`Invalid router path at ${pathname}`);
		}

		return await router[routerPath]({
			// @ts-expect-error
			input: await getBody(request),
		});
	};
}

export function NextGiselleEngine(config: NextGiselleEngineConfig) {
	const giselleEngine = GiselleEngine(config);
	const httpHandler = createHttpHandler({
		giselleEngine,
		basePath: config.basePath,
	});
	return {
		...giselleEngine,
		handlers: {
			GET: httpHandler,
			POST: httpHandler,
		},
	};
}
