import { Button } from "@/components/ui/button";
import { ClickableText } from "@/components/ui/clicable-text";
import { MailIcon } from "lucide-react";
import Link from "next/link";
import { ActionPrompt } from "../components/action-prompt";
/**
@todo Hide at the time of beta release.
import { Divider } from "../components/divider";
*/
import { LegalConsent } from "../components/legal-consent";
/**
@todo Hide at the time of beta release.
import { OAuthProviders } from "../components/oauth-providers";
*/
import { PageHeader } from "../components/page-header";

export default function SignupPage() {
	return (
		<div className="min-h-screen flex items-center justify-center p-4 gap-16">
			<div className="flex flex-col gap-[16px]">
				<h2
					className="text-[40px] font-[500] text-black--30 text-left font-rosart"
					style={{ textShadow: "0px 0px 20px hsla(207, 100%, 48%, 1)" }}
				>
					Unleash Your Potential
					<br />- Free of Charge.
				</h2>
				<p className="text-[18px] font-avenir leading-[30.6px] tracking-tighter text-left text-black-70">
					• Easy setup, no coding required
					<br />• Free forever for core features
					<br />• 14-day trial of premium features & apps
				</p>
			</div>
			<div className="mt-8 space-y-6 w-[320px]">
				<PageHeader title="Get Started for free" />
				{/**
		    @todo Hide at the time of beta release.
				<OAuthProviders />
				<Divider label="or" />
				*/}
				<Button asChild>
					<Link href="/signup/email">
						<p>Sign up for Email</p>
						<MailIcon className="h-5 w-5 mr-2" />
					</Link>
				</Button>
				<LegalConsent />
				<div className="flex justify-center">
					<ActionPrompt
						prompt="Already have an account?"
						action={
							<ClickableText asChild>
								<Link href="/login">Sign in</Link>
							</ClickableText>
						}
					/>
				</div>
			</div>
		</div>
	);
}
