import type { Port } from "../../type";

export const name = "sendMail";

export const label = "Send Mail";

export const inputPorts: Port[] = [
	{ type: "execution", key: "from" },
	{ type: "data", label: "User", key: "user" },
];

export const outputPorts: Port[] = [{ type: "execution", key: "to" }];
