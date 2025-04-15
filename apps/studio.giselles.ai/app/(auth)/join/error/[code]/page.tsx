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

	// ここでチーム名を取得する。実際のコードでは適切なロジックで取得する必要があります
	// この例では固定値を使用します
	const teamName = "Team Name";

	return (
		<div className="min-h-screen flex items-center justify-center p-4 gap-16">
			<div className="flex items-center justify-center py-12">
				<div className="mx-auto grid w-[350px] gap-[24px]">
					{code === "wrong_email" && (
						<div className="text-center">
							<p className="text-white-400 mb-2">You have been invited to join</p>
							<h2
								className="text-[28px] font-[500] text-primary-100 font-hubot"
								style={{ textShadow: "0px 0px 20px #0087F6" }}
							>
								{teamName}
							</h2>
						</div>
					)}
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
