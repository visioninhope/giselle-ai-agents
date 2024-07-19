import type { NodeClass } from "../type";
import * as findUser from "./find-user/node";
import * as onRequest from "./on-request/node";
import * as response from "./response/node";
import * as sendMail from "./send-mail/node";
import * as textGeneration from "./text-generation/node";

export const nodeClasses = [
	findUser,
	sendMail,
	onRequest,
	response,
	textGeneration,
] satisfies NodeClass[];
export type NodeClassName = (typeof nodeClasses)[number]["name"];
