import { Button } from "@/components/ui/button";
import { ClickableText } from "@/components/ui/clicable-text";
import { MailIcon } from "lucide-react";
import Link from "next/link";
import { ActionPrompt } from "../components/action-prompt";
import { Divider } from "../components/divider";
import { LegalConsent } from "../components/legal-consent";
import { OAuthProviders } from "../components/oauth-providers";
import { PageHeader } from "../components/page-header";

export default function SignupPage() {
	return (
		<div className="min-h-screen flex items-center justify-center p-4 gap-16">
			<div className="flex flex-col gap-[16px]">
				<h2
					className="text-[40px] font-medium text-black-30 text-left font-hubot"
					style={{ textShadow: "0px 0px 20px hsla(207, 100%, 48%, 1)" }}
				>
					It&apos;s time to play Giselle.
				</h2>
				<ul className="text-[18px] font-hubot text-left text-white-400 space-y-2">
					<li>• Easy setup, no coding required</li>
					<li>• Free forever for core features</li>
					<li>• 14-day trial of premium features & apps</li>
				</ul>
			</div>
			<div className="mt-8 space-y-6 w-[320px]">
				<PageHeader title="Get Started for free" />
				<OAuthProviders labelPrefix="Sign up" />
				<Divider label="or" />
				<Button asChild className="w-full bg-white-850/10 hover:bg-white-850/20 text-white font-hubot py-2 px-4 rounded-md">
					<Link href="/signup/email" className="flex items-center justify-center gap-2">
						<MailIcon className="h-5 w-5" />
						<span>Sign up for Email</span>
					</Link>
				</Button>
				<LegalConsent />
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
			</div>
		</div>
	);
}
