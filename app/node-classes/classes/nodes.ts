import type { NodeClass } from "../type";
import * as findUser from "./find-user/node";
import * as onRequest from "./on-request/node";
import * as response from "./response/node";
import * as sendMail from "./send-mail/node";
import * as textGeneration from "./text-generation/node";
import * as text from "./text/node";

export const nodeClasses = [
	findUser,
	sendMail,
	onRequest,
	response,
	textGeneration,
	text,
] satisfies NodeClass[];
export type NodeClassName = (typeof nodeClasses)[number]["name"];
export const getNodeClasses = () => JSON.parse(JSON.stringify(nodeClasses));
