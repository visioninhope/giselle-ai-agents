import type { Logger } from "pino";

/**
 * A logger interface compatible with pino, focusing on core logging methods.
 */
export type GiselleLogger = Pick<
	Logger,
	"info" | "warn" | "error" | "debug" | "trace" | "fatal" | "child"
>;
