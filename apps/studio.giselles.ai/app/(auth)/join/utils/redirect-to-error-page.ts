import { redirect } from "next/navigation";

export type ErrorCode = "expired" | "wrong_email" | "already_member";

export function redirectToErrorPage(code: ErrorCode) {
	redirect(`/join/error/${code}`);
}
