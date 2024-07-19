import type { Port } from "../../type";

export const name = "response";

export const label = "Response";

export const inputPorts: Port[] = [
	{ type: "execution", key: "from" },
	{ type: "data", label: "Output", key: "output" },
];
