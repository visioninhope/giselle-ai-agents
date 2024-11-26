import { logger as pinoLogger } from "@/lib/logger";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import {
	BatchLogRecordProcessor,
	ConsoleLogRecordExporter,
	LoggerProvider,
} from "@opentelemetry/sdk-logs";
import { headers } from "./base";

const logExporter = new OTLPLogExporter({
	url: "https://ingest.us.signoz.cloud:443/v1/logs",
	headers,
});

export const logRecordProcessor = new BatchLogRecordProcessor(logExporter);

const loggerProvider = new LoggerProvider();
loggerProvider.addLogRecordProcessor(new BatchLogRecordProcessor(logExporter));
loggerProvider.addLogRecordProcessor(
	new BatchLogRecordProcessor(new ConsoleLogRecordExporter()),
);

const otelLogger = loggerProvider.getLogger("giselle");

export const logger = {
	info: (obj: object | string, msg?: string) => {
		pinoLogger.info(obj, msg);

		if (typeof obj === "string") {
			otelLogger.emit({
				severityText: "INFO",
				body: obj,
			});
		} else {
			otelLogger.emit({
				severityText: "INFO",
				body: msg || "",
				attributes: obj,
			});
		}
	},

	error: (obj: object | string | Error, msg?: string) => {
		pinoLogger.error(obj, msg);

		if (obj instanceof Error) {
			otelLogger.emit({
				severityText: "ERROR",
				body: obj.message,
				attributes: {
					stack: obj.stack,
					...obj,
				},
			});
		} else if (typeof obj === "string") {
			otelLogger.emit({
				severityText: "ERROR",
				body: obj,
			});
		} else {
			otelLogger.emit({
				severityText: "ERROR",
				body: msg || "",
				attributes: obj,
			});
		}
	},

	debug: (obj: object | string, msg?: string) => {
		pinoLogger.debug(obj, msg);

		if (typeof obj === "string") {
			otelLogger.emit({
				severityText: "DEBUG",
				body: obj,
			});
		} else {
			otelLogger.emit({
				severityText: "DEBUG",
				body: msg || "",
				attributes: obj,
			});
		}
	},
};
