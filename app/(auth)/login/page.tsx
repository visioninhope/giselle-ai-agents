import { Divider } from "../components/divider";
import { OAuthProviders } from "../components/oauth-providers";
import { PageTitle } from "../components/page-title";
import { LoginForm } from "./login-form";

export default function Page() {
	return (
		<div className="min-h-screen flex items-center justify-center p-4 gap-16">
			<div className="flex items-center justify-center py-12">
				<div className="mx-auto grid w-[350px] gap-[24px]">
					<PageTitle>Log in to Giselle</PageTitle>
					<div className="grid gap-[16px]">
						<OAuthProviders labelPrefix="Continue" />
						<Divider />
						<LoginForm />

						{/**
						 * We are planning a pricing revision.
						 * Temporarily hide new signups until the new plan is ready.
						 **/}
						{/* <div className="flex justify-center">
							<ActionPrompt
								prompt="Don&apos;t have an account?"
								action={
									<ClickableText asChild>
										<Link href="/signup">Sign up</Link>
									</ClickableText>
								}
							/>
						</div> */}
					</div>
				</div>
			</div>
		</div>
	);
}
