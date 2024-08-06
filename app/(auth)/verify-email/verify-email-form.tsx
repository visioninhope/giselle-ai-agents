"use client";

import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { SubmitButton } from "@/components/ui/submit-button";
import { type FC, useActionState, useCallback, useRef } from "react";
import { verifyEmail } from "./verify-email";

type VerifyEmailForm = {
	verificationEmail: string;
};
export const VerifyEmailForm: FC<VerifyEmailForm> = ({ verificationEmail }) => {
	const [authError, action] = useActionState(verifyEmail, null);
	const formRef = useRef<HTMLFormElement>(null);
	const handleComplete = useCallback(() => {
		formRef.current?.requestSubmit();
	}, []);
	return (
		<form className="flex justify-center" action={action} ref={formRef}>
			<div className="grid gap-4">
				<InputOTP
					maxLength={6}
					data-1p-ignore
					name="token"
					onComplete={handleComplete}
				>
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
				<input
					type="hidden"
					name="verificationEmail"
					value={verificationEmail}
				/>
				<SubmitButton className="w-full">Verify</SubmitButton>
			</div>
		</form>
	);
};
