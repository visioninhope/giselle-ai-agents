import { Button } from "@/components/ui/button";
import { teamInvitationViaEmailFlag } from "@/flags";
import { getUser } from "@/lib/supabase";
import type { User } from "@supabase/auth-js";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { fetchInvitationToken } from "../utils/invitation-token";
import { redirectToErrorPage } from "../utils/redirect-to-error-page";

export default async function Page({ params }: { params: { token: string } }) {
	const isTeamInvitationViaEmail = await teamInvitationViaEmailFlag();
	if (!isTeamInvitationViaEmail) {
		return notFound();
	}

	const token = await fetchInvitationToken(params.token);
	if (!token) {
		return notFound();
	}
	if (token.expiredAt < new Date()) {
		redirectToErrorPage("expired");
	}

	let user: User | null = null;
	try {
		user = await getUser();
	} catch (e) {
		redirect(`/join/${encodeURIComponent(params.token)}/login`);
	}

	// FIXME: stub for debugging
	// if (user.email !== token.invitedEmail) {
	if (token.token === "wrong-email-token") {
		redirectToErrorPage("wrong_email");
	}
	if (token.token === "already-member-token") {
		redirectToErrorPage("already_member");
	}

	return (
		<div className="min-h-screen flex items-center justify-center p-4 gap-16">
			<div className="flex items-center justify-center py-12">
				<div className="mx-auto grid w-[350px] gap-[24px]">
					<div className="text-center">
						<p className="text-slate-400 mb-2">You have been invited to join</p>
						<h2
							className="text-[28px] font-[500] text-primary-100 font-hubot"
							style={{ textShadow: "0px 0px 20px #0087F6" }}
						>
							{token.teamName}
						</h2>
					</div>
					<div className="grid gap-[16px]">
						<Button className="w-full font-medium">Join to team</Button>

						<div className="text-sm text-center text-slate-400 mt-4">
							By continuing, you agree to our{" "}
							<Link href="/terms" className="text-blue-300 hover:underline">
								Terms of Service
							</Link>{" "}
							and{" "}
							<Link href="/privacy" className="text-blue-300 hover:underline">
								Privacy Policy
							</Link>
							.
						</div>

						<div className="flex justify-center mt-4">
							<Link
								href="#"
								className="text-white hover:text-white/80 underline"
							>
								Decline
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
