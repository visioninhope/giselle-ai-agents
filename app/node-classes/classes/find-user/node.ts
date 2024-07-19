import type { Port } from "../../type";

export const name = "findUser";

export const label = "Find User";

export const inputPorts: Port[] = [{ type: "execution", key: "from" }];
export const outputPorts: Port[] = [
	{ type: "execution", key: "to" },
	{ type: "data", key: "user" },
];
