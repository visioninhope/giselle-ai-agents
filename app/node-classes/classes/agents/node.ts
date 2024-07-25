import type { Port } from "../../type";

export const name = "agent";

export const label = "Agent";

export const inputPorts: Port[] = [{ type: "execution", key: "from" }];
export const outputPorts: Port[] = [
	{ type: "execution", key: "to" },
	{
		type: "data",
		key: "result",
		label: "Result",
	},
];
