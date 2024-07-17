import type { Port } from "../type";

export const name = "findUser";

export const label = "Find User";

export const inputPorts: Port[] = [{ type: "execution" }];
export const outputPorts: Port[] = [{ type: "execution" }, { type: "data" }];
