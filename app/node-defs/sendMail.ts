import type { Port } from "./type";

export const key = "sendMail";

export const label = "Send Mail";

export const inputPorts: Port[] = [
	{ type: "execution" },
	{ type: "data", label: "User" },
];
