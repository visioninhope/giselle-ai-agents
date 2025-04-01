import { ClickableText } from "@/components/ui/clicable-text";
import Link from "next/link";
import { ActionPrompt } from "../components/action-prompt";
import { Divider } from "../components/divider";
import { OAuthProviders } from "../components/oauth-providers";
import { PageHeader } from "../components/page-header";
import { LoginForm } from "./login-form";

export default function Page() {
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
			<div className="mx-auto grid w-[320px] gap-[24px]">
				<PageHeader title="Log in" />
				<div className="grid gap-[16px]">
					<OAuthProviders labelPrefix="Continue" />
					<Divider />
					<LoginForm />

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
	);
}
