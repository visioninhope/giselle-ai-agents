import { Button } from "@/components/ui/button";
import { SiGithub, SiGoogle } from "@icons-pack/react-simple-icons";
import { MailIcon } from "lucide-react";
import Link from "next/link";
import { Divider } from "../components/divider";
import { LinkText } from "../components/link-text";
import { OAuthProviders } from "../components/oauth-providers";

export default function SignupPage() {
	return (
		<div className="min-h-screen flex items-center justify-center p-4 gap-16">
			<div className="flex flex-col gap-[16px]">
				<h2
					className="text-3xl font-extrabold text-black--30 text-left font-[Rosart]"
					style={{ textShadow: "0px 0px 20px hsla(207, 100%, 48%, 1)" }}
				>
					Unleash Your Potential
					<br />- Free of Charge.
				</h2>
				<p className="text-lg leading-[30.6px] tracking-tighter text-left text-black-50">
					• Easy setup, no coding required
					<br />• Free forever for core features
					<br />• 14-day trial of premium features & apps
				</p>
			</div>
			<div className="mt-8 space-y-6 w-[320px]">
				<div className="text-black-30 font-[Rosart] text-[32px] font-normal leading-[38.4px] tracking-tighter text-center">
					Get Started for free
				</div>
				<OAuthProviders />
				<Divider label="or" />
				<Button asChild>
					<Link href="/signup/email">
						<p>Sign up for Email</p>
						<MailIcon className="h-5 w-5 mr-2" />
					</Link>
				</Button>
				<p className="mt-2 text-center text-sm text-gray-400">
					By continuing, you agree to our{" "}
					<Link
						href="/legal/tos"
						className="font-medium text-cyan-300 hover:text-cyan-200"
					>
						Terms of Service
					</Link>{" "}
					and{" "}
					<Link
						href="/legal/privacy"
						className="font-medium text-cyan-300 hover:text-cyan-200"
					>
						Privacy Policy
					</Link>
				</p>
				<p className="text-center text-sm text-gray-400 font-[Rosart]">
					Already have an account?{" "}
					<LinkText asChild>
						<Link href="/login">Log in</Link>
					</LinkText>
				</p>
			</div>
		</div>
	);
}
