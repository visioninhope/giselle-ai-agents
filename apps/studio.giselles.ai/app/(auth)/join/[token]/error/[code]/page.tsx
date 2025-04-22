import { ActionPrompt } from "@/app/(auth)/components/action-prompt";
import type { ErrorCode } from "@/app/(auth)/join/errors";
import { fetchInvitationToken } from "@/app/(auth)/join/utils/invitation-token";
import { Button } from "@/components/ui/button";
import { ClickableText } from "@/components/ui/clickable-text";
import { teamInvitationViaEmailFlag } from "@/flags";
import Link from "next/link";
import { notFound } from "next/navigation";
import { signoutUser } from "../../../actions";

const errorMessages: Record<ErrorCode, string> = {
	expired: "This invitation has expired.",
	wrong_email: `The email address you're currently using doesn't match the email this invitation was intended for. To join this workspace, please sign out and then either sign in with the email address specified in the invitation or create a new account using that email address.`,
	already_member: "You're already a member of this team.",
} as const;

export default async function Page({
	params,
}: { params: Promise<{ token: string; code: string }> }) {
	const { token, code } = await params;
	const isTeamInvitationViaEmail = await teamInvitationViaEmailFlag();
	if (!isTeamInvitationViaEmail) {
		return notFound();
	}

	if (!token || !code) {
		return notFound();
	}

	const errorMessage = errorMessages[code as ErrorCode];
	if (!errorMessage) {
		return notFound();
	}

	// fetch invitation token from db
	const invitation = await fetchInvitationToken(token);
	const teamName = invitation?.teamName ?? "Team";

	return (
		<div className="min-h-screen flex items-center justify-center p-4 gap-16">
			<div className="flex items-center justify-center py-12">
				<div className="mx-auto grid w-[350px] gap-[24px]">
					{code === "wrong_email" && (
						<div className="text-center">
							<p className="text-white-400 mb-2">
								You have been invited to join
							</p>
							<h2
								className="text-[28px] font-[500] text-primary-100 font-hubot"
								style={{ textShadow: "0px 0px 20px #0087F6" }}
							>
								{teamName}
							</h2>
						</div>
					)}

					{code === "already_member" ? (
						<div className="flex flex-col items-center justify-center gap-6">
							<h2 className="text-[28px] font-[500] text-white font-hubot text-center">
								{errorMessage}
							</h2>
							<Link href="/settings/team" className="w-full">
								<Button className="w-full font-medium bg-blue-200 hover:bg-blue-300 text-black-900">
									Go to team
								</Button>
							</Link>
						</div>
					) : code === "expired" ? (
						<div className="flex flex-col items-center justify-center gap-6">
							<h2 className="text-[28px] font-[500] text-white font-hubot text-center">
								{errorMessage}
							</h2>
							<p className="text-white-400 text-center">
								Please ask the team administrator to send you a new invitation.
							</p>
							<div className="flex flex-col items-center justify-center gap-2 mt-4">
								<div className="flex justify-center">
									<ActionPrompt
										prompt="Already have an account?"
										action={
											<ClickableText asChild>
												<Link href="/login">Log in</Link>
											</ClickableText>
										}
									/>
								</div>
								<div className="flex justify-center">
									<ActionPrompt
										prompt="or"
										action={
											<ClickableText asChild>
												<Link href="/signup">Create an account</Link>
											</ClickableText>
										}
									/>
								</div>
							</div>
						</div>
					) : (
						<div className="grid gap-[16px]">
							<div className="text-white text-center p-4 text-sm">
								{errorMessage}
							</div>

							{code === "wrong_email" && (
								<form action={signoutUser} method="post">
									<input type="hidden" name="token" value={token} />
									<Button type="submit" className="w-full font-medium mt-2">
										Sign out
									</Button>
								</form>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
