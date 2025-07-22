import { z } from "zod/v4";
import type { GiselleEngineContext } from "../types";
import { CreateActInputs, createAct } from "./create-act";
import type { Act } from "./object";
import { type StartActCallbacks, StartActInputs, startAct } from "./start-act";

interface CreateAndStartActCallbacks extends StartActCallbacks {
	actCreate?: (args: { act: Act }) => void | Promise<void>;
}

export const CreateAndStartActInputs = z.object({
	...CreateActInputs.shape,
	...StartActInputs.omit({ actId: true }).shape,
	...z.object({
		callbacks: z.optional(z.custom<CreateAndStartActCallbacks>()),
	}).shape,
});
export type CreateAndStartActInputs = z.infer<typeof CreateAndStartActInputs>;

/** @todo telemetry */
export async function createAndStartAct(
	args: CreateAndStartActInputs & {
		context: GiselleEngineContext;
	},
) {
	const act = await createAct(args);
	await args.callbacks?.actCreate?.({ act });
	await startAct({
		context: args.context,
		actId: act.id,
		callbacks: args.callbacks,
	});
}
