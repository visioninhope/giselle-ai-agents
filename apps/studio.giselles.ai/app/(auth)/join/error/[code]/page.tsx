import { Button } from "@/components/ui/button";
import { teamInvitationViaEmailFlag } from "@/flags";
import { notFound } from "next/navigation";
import type { ErrorCode } from "../../utils/redirect-to-error-page";

const errorMessages: Record<ErrorCode, string> = {
	expired: "Expired token",
	wrong_email: `The email address you're currently using doesn't match the email
							this invitation was intended for. To join this workspace, please
							sign out and then either sign in with the email address specified
							in the invitation or create a new account using that email
							address.`,
	already_member: "Already member",
} as const;

export default async function Page({ params }: { params: { code: string } }) {
	const isTeamInvitationViaEmail = await teamInvitationViaEmailFlag();
	if (!isTeamInvitationViaEmail) {
		return notFound();
	}

	const code = params.code;
	if (!code) {
		return notFound();
	}

	const errorMessage = errorMessages[code as ErrorCode];
	if (!errorMessage) {
		return notFound();
	}

	return (
		<div className="min-h-screen flex items-center justify-center p-4 gap-16">
			<div className="flex items-center justify-center py-12">
				<div className="mx-auto grid w-[350px] gap-[24px]">
					<div className="grid gap-[16px]">
						<div className="text-white text-center p-4 text-sm">
							{errorMessage}
						</div>

						{code === "wrong_email" && (
							<Button className="w-full font-medium">Sign out</Button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
