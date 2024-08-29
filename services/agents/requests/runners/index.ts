import { start as startWithTriggerDev } from "./trigger.dev";
import type { StartRunnerArgs } from "./types";
import { start as startWithVercel } from "./vercel-functions";

export const runOnVercel = async (args: StartRunnerArgs) =>
	await startWithVercel(args);
export const runOnTriggerDev = async (args: StartRunnerArgs) =>
	await startWithTriggerDev(args);
