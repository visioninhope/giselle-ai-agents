import { metrics } from "@opentelemetry/api";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { SEMRESATTRS_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

// Configure OTLP metrics exporter
const otlpMetricsExporter = new OTLPMetricExporter({
	url: "https://ingest.us.signoz.cloud:443/v1/metrics",
	headers: {
		"signoz-access-token": process.env.SIGNOZ_INGESTION_TOKEN,
	},
});

// Define resource with service name
const sdk = new NodeSDK({
	resource: new Resource({
		[SEMRESATTRS_SERVICE_NAME]: "serverside",
		environment: process.env.NEXT_PUBLIC_VERCEL_ENV || "not-set",
	}),
	metricReader: new PeriodicExportingMetricReader({
		exporter: otlpMetricsExporter,
		exportIntervalMillis: 10000,
	}),
});
sdk.start();
