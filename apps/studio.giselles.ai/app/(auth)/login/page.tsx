import { ClickableText } from "@/components/ui/clickable-text";
import Link from "next/link";
import { ActionPrompt } from "../components/action-prompt";
import { Divider } from "../components/divider";
import { LegalConsent } from "../components/legal-consent";
import { OAuthProviders } from "../components/oauth-providers";
import { LoginForm } from "./login-form";

export default function Page() {
	return (
		<div className="min-h-screen flex items-center justify-center p-4 gap-16">
			<div className="flex items-center justify-center py-12">
				<div className="mx-auto grid w-[350px] gap-[24px]">
					<h2
						className="mt-6 text-[28px] font-[500] text-primary-100 font-sans text-center"
						style={{ textShadow: "0px 0px 20px #0087F6" }}
					>
						Log in to Giselle
					</h2>
					<div className="grid gap-[16px]">
						<OAuthProviders labelPrefix="Continue" />
						<Divider />
						<LoginForm />
						<LegalConsent />
						<div className="flex justify-center">
							<ActionPrompt
								prompt="Don&apos;t have an account?"
								action={
									<ClickableText asChild>
										<Link href="/signup">Sign up</Link>
									</ClickableText>
								}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
