import type { RunningRun } from "@giselle-sdk/data-type";
import type { z } from "zod";
import { getRun, setRun } from "../helpers/run";
import { startRun } from "../schema";
import type { GiselleEngineHandlerArgs } from "./types";

const Input = startRun.Input;
type Input = z.infer<typeof Input>;
export async function startRunHandler({
	unsafeInput,
	context,
}: GiselleEngineHandlerArgs<Input>) {
	const input = Input.parse(unsafeInput);
	const run = await getRun({
		storage: context.storage,
		runId: input.runId,
	});
	if (run === undefined) {
		throw new Error("Run not found");
	}
	if (run.status !== "queued") {
		throw new Error("Run not queued");
	}
	await setRun({
		storage: context.storage,
		run: {
			...run,
			status: "running",
			startedAt: Date.now(),
		} satisfies RunningRun,
	});
}
