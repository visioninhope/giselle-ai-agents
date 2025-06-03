import type {
	CompletedGeneration,
	RunningGeneration,
} from "@giselle-sdk/data-type";
import { calculateDisplayCost } from "@giselle-sdk/language-model";
import type { LLMGeneration, LLMSpan, LLMTracer } from "@giselle-sdk/telemetry";
import { generateTelemetryTags } from "@giselle-sdk/telemetry";
import type { AttributeValue } from "@opentelemetry/api";
import type { ToolSet } from "ai";
import { Langfuse } from "langfuse";

export const USAGE_UNITS = [
	"CHARACTERS",
	"TOKENS",
	"MILLISECONDS",
	"SECONDS",
	"IMAGES",
	"REQUESTS",
] as const;

type ValidUsageUnit = (typeof USAGE_UNITS)[number];

function validateUsageUnit(unit: string): ValidUsageUnit {
	const normalizedUnit = unit.toUpperCase();
	if (USAGE_UNITS.includes(normalizedUnit as ValidUsageUnit)) {
		return normalizedUnit as ValidUsageUnit;
	}
	return "TOKENS";
}

export type LLMUsage = {
	input: number;
	output: number;
	total: number;
	inputCost: number;
	outputCost: number;
	totalCost: number;
	unit: string;
};

export class LangfuseSpan implements LLMSpan {
	constructor(
		private readonly span: unknown,
		public readonly name: string,
		public readonly startTime: Date,
		public readonly endTime: Date,
		public readonly attributes: Record<string, unknown>,
	) {}
}

type LangfuseTraceType = {
	span: (args: {
		name: string;
		metadata?: Record<string, unknown>;
		startTime: Date;
		input: { messages: unknown[] };
		endTime: Date;
		output: string;
	}) => unknown;
	generation: (args: {
		name: string;
		model: string;
		modelParameters: Record<string, unknown>;
		metadata?: Record<string, unknown>;
		input: { messages: unknown[] };
		startTime: Date;
		completionStartTime: Date;
		endTime: Date;
		output: string;
		usage: LLMUsage;
	}) => unknown;
};

export class LangfuseTrace {
	constructor(private readonly trace: LangfuseTraceType) {}

	span(args: {
		name: string;
		startTime: Date;
		input: { messages: unknown[] };
		output: string;
		metadata?: Record<string, unknown>;
		endTime: Date;
	}): LLMSpan {
		const span = this.trace.span({
			name: args.name,
			metadata: args.metadata,
			startTime: args.startTime,
			input: args.input,
			endTime: args.endTime,
			output: args.output,
		});
		return new LangfuseSpan(
			span,
			args.name,
			args.startTime,
			args.endTime,
			args.metadata ?? {},
		);
	}

	generation(args: {
		name: string;
		model: string;
		modelParameters: Record<string, unknown>;
		input: { messages: unknown[] };
		usage: LLMUsage;
		startTime: Date;
		completionStartTime: Date;
		metadata?: Record<string, unknown>;
		output: string;
		endTime: Date;
	}): LLMGeneration {
		const span = this.trace.generation({
			name: args.name,
			model: args.model,
			modelParameters: args.modelParameters,
			metadata: args.metadata,
			input: args.input,
			startTime: args.startTime,
			completionStartTime: args.completionStartTime,
			endTime: args.endTime,
			output: args.output,
			usage: args.usage,
		});
		return {
			messages: args.input.messages,
			output: args.output,
			usage: args.usage,
		};
	}
}

export class LangfuseTracer implements LLMTracer {
	constructor(private readonly langfuse: Langfuse) {}

	async createAndEmit(args: {
		runningGeneration: RunningGeneration;
		completedGeneration: CompletedGeneration;
		tokenUsage: {
			promptTokens: number;
			completionTokens: number;
			totalTokens: number;
		};
		provider: string;
		modelId: string;
		telemetry?: {
			metadata?: Record<string, unknown>;
		};
		messages: { messages: unknown[] };
		output: string;
		toolSet: ToolSet;
		configurations: Record<string, unknown>;
		providerOptions?: {
			anthropic?: Record<string, unknown>;
		};
		traceName?: string;
		spanName?: string;
		generationName?: string;
		unit: string;
	}): Promise<void> {
		try {
			const metadata: Record<
				string,
				string | number | boolean | string[] | null | undefined
			> = {
				...(args.telemetry?.metadata ?? {}),
				...(process.env.VERCEL_DEPLOYMENT_ID && {
					deploymentId: process.env.VERCEL_DEPLOYMENT_ID,
				}),
			};

			const trace = this.langfuse.trace({
				userId: String(metadata.userId ?? ""),
				name: args.traceName ?? "llm-generation",
				metadata,
				input: args.messages,
				output: args.output,
				tags: generateTelemetryTags({
					provider: args.provider,
					modelId: args.modelId,
					toolSet: args.toolSet,
					configurations: args.configurations,
					providerOptions: args.providerOptions,
				}),
			});

			const span = trace.span({
				name: args.spanName ?? "llm-generation",
				startTime: new Date(args.runningGeneration.queuedAt),
				input: args.messages,
				output: args.output,
				metadata,
				endTime: new Date(args.completedGeneration.completedAt),
			});

			const modelParameters: Record<
				string,
				string | number | boolean | string[] | null | undefined
			> = {};
			for (const [key, value] of Object.entries(args.configurations)) {
				if (
					typeof value === "string" ||
					typeof value === "number" ||
					typeof value === "boolean" ||
					Array.isArray(value) ||
					value === null ||
					value === undefined
				) {
					modelParameters[key] = value as
						| string
						| number
						| boolean
						| string[]
						| null
						| undefined;
				} else if (Array.isArray(value)) {
					modelParameters[key] = (value as unknown[]).filter(
						(v) => typeof v === "string",
					) as string[];
				} else {
					modelParameters[key] = String(value);
				}
			}

			const displayCost = await calculateDisplayCost(
				args.provider,
				args.modelId,
				args.tokenUsage,
			);

			span.generation({
				name: args.generationName ?? "llm-generation",
				model: args.modelId,
				modelParameters,
				input: args.messages,
				usage: {
					input: args.tokenUsage.promptTokens,
					output: args.tokenUsage.completionTokens,
					total: args.tokenUsage.totalTokens,
					inputCost: displayCost.inputCostForDisplay ?? 0,
					outputCost: displayCost.outputCostForDisplay ?? 0,
					totalCost: displayCost.totalCostForDisplay ?? 0,
					unit: validateUsageUnit(args.unit),
				},
				startTime: new Date(args.runningGeneration.createdAt),
				completionStartTime: new Date(args.runningGeneration.startedAt),
				metadata,
				output: args.output,
				endTime: new Date(args.completedGeneration.completedAt),
			});

			await this.langfuse.shutdownAsync();
		} catch (error) {
			console.error("Telemetry emission failed:", error);
		}
	}
}

export function createLangfuseTracer(): LLMTracer {
	const langfuse = new Langfuse();
	return new LangfuseTracer(langfuse);
}
