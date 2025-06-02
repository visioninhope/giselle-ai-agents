import type {
	CompletedGeneration,
	RunningGeneration,
} from "@giselle-sdk/data-type";
import type { LLMGeneration, LLMSpan, LLMTracer } from "@giselle-sdk/telemetry";
import type { AttributeValue } from "@opentelemetry/api";
import { Langfuse } from "langfuse";

export type UsageUnit =
	| "CHARACTERS"
	| "TOKENS"
	| "MILLISECONDS"
	| "SECONDS"
	| "IMAGES"
	| "REQUESTS";

export type LLMUsage = {
	input: number;
	output: number;
	total: number;
	inputCost: number;
	outputCost: number;
	totalCost: number;
	unit: UsageUnit;
};

export class LangfuseSpan implements LLMSpan {
	constructor(
		private readonly span: any,
		public readonly name: string,
		public readonly startTime: number,
		public readonly endTime: number,
		public readonly attributes: Record<string, unknown>,
	) {}

	update(update: {
		metadata?: Record<string, unknown>;
		usage?: LLMUsage;
	}): void {
		this.span.update({
			metadata: update.metadata,
			usage: update.usage,
		});
	}

	end(): void {
		this.span.end();
	}
}

export class LangfuseTrace {
	constructor(private readonly trace: any) {}

	span(args: {
		name: string;
		startTime: Date;
		output: string;
		metadata?: Record<string, unknown>;
		endTime: Date;
	}): LLMSpan {
		const span = this.trace.span({
			name: args.name,
			metadata: args.metadata,
			startTime: args.startTime,
			endTime: args.endTime,
			output: args.output,
		});
		return new LangfuseSpan(
			span,
			args.name,
			args.startTime.getTime(),
			args.endTime.getTime(),
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
		toolSet: Record<string, unknown>;
		configurations: Record<string, unknown>;
		providerOptions?: {
			anthropic?: Record<string, unknown>;
		};
	}): Promise<void> {
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
			name: "llm-generation",
			metadata,
			input: args.messages,
			output: args.output,
			tags: [args.provider, args.modelId],
		});

		const span = trace.span({
			name: "llm-generation",
			startTime: new Date(args.runningGeneration.queuedAt),
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

		span.generation({
			name: "llm-generation",
			model: args.modelId,
			modelParameters,
			input: args.messages,
			usage: args.completedGeneration.usage,
			startTime: new Date(args.runningGeneration.createdAt),
			completionStartTime: new Date(args.runningGeneration.startedAt),
			metadata,
			output: args.output,
			endTime: new Date(args.completedGeneration.completedAt),
		});

		await this.langfuse.shutdownAsync();
	}
}

export function createLangfuseTracer(): LLMTracer {
	const langfuse = new Langfuse();
	return new LangfuseTracer(langfuse);
}
