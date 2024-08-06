import { cookies } from "next/headers";
import { VerifyEmailForm } from "./verify-email-form";
export default function EmailConfirmationPage() {
	const verificationEmail =
		cookies().get("verification-email")?.value ||
		"satoshi.toyama+a1@route06.co.jp";
	if (verificationEmail == null) {
		throw new Error("Unexpected error: Please retry the registration process");
	}
	return (
		<div className="flex items-center justify-center py-12">
			<div className="mx-auto grid w-[550px] gap-6">
				<div className="grid gap-2 text-center">
					<h1 className="text-3xl font-bold">Verify Your Email</h1>
					<p className="text-balance text-muted-foreground">
						We've sent a one-time password to your email. Please enter it below
						to complete your registration.
					</p>
				</div>
				<VerifyEmailForm verificationEmail={verificationEmail} />
			</div>
		</div>
	);
}
