import { redirect } from "next/navigation";
import type { ErrorCode } from "../errors";

export function redirectToErrorPage(code: ErrorCode) {
	redirect(`/join/error/${code}`);
}
