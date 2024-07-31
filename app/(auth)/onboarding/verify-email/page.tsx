import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { createClient } from "@/lib/supabase";
import { cookies } from "next/headers";
export default function EmailConfirmationPage() {
	const email = cookies().get("email")?.value;
	const verifyOtp = async (formData: FormData) => {
		"use server";
		formData.get("email");
		const supabase = createClient();
		// const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email'})
	};
	if (email == null) {
		throw new Error("Unexpected error: Please retry the registration process");
	}
	return (
		<div className="flex items-center justify-center py-12">
			<div className="mx-auto grid w-[550px] gap-6">
				<div className="grid gap-2 text-center">
					<h1 className="text-3xl font-bold">Verify Your Email</h1>
					<p className="text-balance text-muted-foreground">
						We've sent a one-time password to your email({email}). Please enter
						it below to complete your registration.
					</p>
				</div>
				<form className="flex justify-center">
					<InputOTP maxLength={6} data-1p-ignore name="token">
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
					<input type="hidden" name="email" value={email} />
				</form>
			</div>
		</div>
	);
}
