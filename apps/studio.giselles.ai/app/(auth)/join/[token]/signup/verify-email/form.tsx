"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { TriangleAlertIcon } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { resendJoinOtp, verifyJoinEmail } from "./actions";

export function JoinVerifyForm({
	invitedEmail,
	invitationToken,
}: { invitedEmail: string; invitationToken: string }) {
	const [error, setError] = useState<string | null>(null);
	const [isPending, setIsPending] = useState(false);
	const [resendState, setResendState] = useState<{
		code: string;
		message: string;
	} | null>(null);
	const formRef = useRef<HTMLFormElement>(null);

	const handleSubmit = useCallback(
		async (formData: FormData) => {
			setError(null);
			setIsPending(true);
			formData.set("invitedEmail", invitedEmail);
			formData.set("invitationToken", invitationToken);
			const result = await verifyJoinEmail(formData);
			if (result?.error) {
				setError(result.error);
				setIsPending(false);
			}
		},
		[invitedEmail, invitationToken],
	);

	const handleResend = useCallback(
		async (e: React.MouseEvent<HTMLButtonElement>) => {
			e.preventDefault();
			const formData = new FormData();
			formData.set("invitedEmail", invitedEmail);
			const result = await resendJoinOtp(formData);
			if (result?.code === "success") {
				setResendState({ code: "success", message: result.message });
			} else {
				setResendState({
					code: "error",
					message: result?.message || "Failed to resend code.",
				});
			}
		},
		[invitedEmail],
	);

	return (
		<form ref={formRef} action={handleSubmit} className="flex justify-center">
			<div className="grid gap-4">
				{error && (
					<Alert variant="destructive">
						<TriangleAlertIcon className="w-4 h-4" />
						<AlertTitle>Authentication Error</AlertTitle>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}
				{resendState && (
					<Alert
						variant={resendState.code === "success" ? "primary" : "destructive"}
					>
						<TriangleAlertIcon className="w-4 h-4" />
						<AlertTitle>
							{resendState.code === "success" ? "Success" : "Error"}
						</AlertTitle>
						<AlertDescription>{resendState.message}</AlertDescription>
					</Alert>
				)}
				<InputOTP maxLength={6} name="token" className="notranslate">
					<InputOTPGroup>
						<InputOTPSlot index={0} />
						<InputOTPSlot index={1} />
						<InputOTPSlot index={2} />
					</InputOTPGroup>
					<InputOTPSeparator />
					<InputOTPGroup>
						<InputOTPSlot index={3} />
						<InputOTPSlot index={4} />
						<InputOTPSlot index={5} />
					</InputOTPGroup>
				</InputOTP>
				<input type="hidden" name="invitedEmail" value={invitedEmail} />
				<input type="hidden" name="invitationToken" value={invitationToken} />
				<div className="flex justify-center">
					<button
						type="button"
						className="text-blue-300 hover:underline text-sm mt-2"
						onClick={handleResend}
						disabled={isPending}
					>
						Resend code
					</button>
				</div>
				<Button
					className="w-full font-medium"
					type="submit"
					disabled={isPending}
				>
					{isPending ? "Verifying..." : "Verify"}
				</Button>
			</div>
		</form>
	);
}
