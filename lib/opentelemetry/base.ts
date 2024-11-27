import { versionInfo } from "@/version";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

export const headers: Record<string, string> = {
	"signoz-access-token": process.env.SIGNOZ_INGESTION_TOKEN ?? "",
};

export const resource = new Resource({
	[SemanticResourceAttributes.SERVICE_VERSION]: versionInfo.tag,
	"git.branch": versionInfo.branch,
	"build.time": versionInfo.buildTime,
});
