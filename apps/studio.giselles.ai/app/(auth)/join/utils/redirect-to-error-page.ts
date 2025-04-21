import { redirect } from "next/navigation";
import type { ErrorCode } from "../errors";

export function redirectToErrorPage(token: string, code: ErrorCode) {
	redirect(`/join/${token}/error/${code}`);
}
