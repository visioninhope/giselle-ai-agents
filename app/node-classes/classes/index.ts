import invariant from "tiny-invariant";
import type { NodeClass } from "../type";
import * as findUser from "./find-user";
import * as onRequest from "./on-request";
import * as response from "./response";
import * as sendMail from "./send-mail";

export const nodeClasses = [
	findUser,
	sendMail,
	onRequest,
	response,
] satisfies NodeClass[];
export type NodeClassName = (typeof nodeClasses)[number]["name"];

export const getNodeClass = (className: NodeClassName): NodeClass => {
	const nodeClass = nodeClasses.find(
		(nodeClass) => nodeClass.name === className,
	);
	invariant(nodeClass != null, "missing nodeDef");
	return nodeClass;
};
