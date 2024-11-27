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

type SeverityText = "INFO" | "ERROR" | "DEBUG";

function emitLog(
	severity: SeverityText,
	obj: object | string | Error,
	msg?: string,
) {
	if (obj instanceof Error) {
		otelLogger.emit({
			severityText: severity,
			body: obj.message,
			attributes: {
				stack: obj.stack,
				...obj,
			},
		});
	} else if (typeof obj === "string") {
		otelLogger.emit({
			severityText: severity,
			body: obj,
		});
	} else {
		otelLogger.emit({
			severityText: severity,
			body: msg || "",
			attributes: obj,
		});
	}
}

export const logger = {
	info: (obj: object | string, msg?: string) => {
		pinoLogger.info(obj, msg);
		emitLog("INFO", obj, msg);
	},

	error: (obj: object | string | Error, msg?: string) => {
		pinoLogger.error(obj, msg);
		emitLog("ERROR", obj, msg);
	},

	debug: (obj: object | string, msg?: string) => {
		pinoLogger.debug(obj, msg);
		emitLog("DEBUG", obj, msg);
	},
};
