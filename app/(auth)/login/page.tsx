import Link from "next/link";
import { Divider } from "../components/divider";
import { OAuthProviders } from "../components/oauth-providers";
import { PageTitle } from "../components/page-title";
import { LoginForm } from "./login-form";

export default function Page() {
	return (
		<div className="min-h-screen flex items-center justify-center p-4 gap-16">
			<div className="flex items-center justify-center py-12">
				<div className="mx-auto grid w-[350px] gap-[24px]">
					<PageTitle>Login to Giselle</PageTitle>
					<div className="grid gap-[16px]">
						<OAuthProviders />
						<Divider />
						<LoginForm />
						<div className="mt-4 text-center text-sm">
							Don&apos;t have an account?{" "}
							<Link href="/signup" className="underline">
								Sign up
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
