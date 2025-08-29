import type { GiselleLogger } from "./types";

const noop = () => {};

export const noopLogger: GiselleLogger = {
	info: noop,
	warn: noop,
	error: noop,
	debug: noop,
	trace: noop,
	fatal: noop,
	child: () => noopLogger,
};
