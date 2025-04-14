import { ClickableText } from "@/components/ui/clicable-text";
import Link from "next/link";
import { ActionPrompt } from "../components/action-prompt";
import { LegalConsent } from "../components/legal-consent";
import { LoginForm } from "./login-form";

// Simple static page for team invitations
export default function Page() {
	return (
		<div className="min-h-screen flex items-center justify-center p-4 gap-16">
			<div className="flex items-center justify-center py-12">
				<div className="mx-auto grid w-[350px] gap-[24px]">
					<div className="text-center">
						<p className="text-white-400 mb-2">
							You have been invited to join
						</p>
						<h2
							className="text-[28px] font-[500] text-primary-100 font-hubot"
							style={{ textShadow: "0px 0px 20px #0087F6" }}
						>
							Team name
						</h2>
					</div>
					<div className="grid gap-[16px]">
						<LoginForm />
						<LegalConsent />
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
