import { registerOTel } from "@vercel/otel";
import { LangfuseExporter } from "langfuse-vercel";

export async function register() {
	if (process.env.NEXT_RUNTIME === "nodejs") {
		await import("./sentry.server.config");
		await import("./instrumentation.node");
	}

	if (process.env.NEXT_RUNTIME === "edge") {
		await import("./sentry.edge.config");
	}

	registerOTel({
		serviceName: "langfuse-vercel-giselle",
		traceExporter: new LangfuseExporter(),
	});
}
