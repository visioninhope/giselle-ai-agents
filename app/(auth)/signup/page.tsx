import { Button } from "@/components/ui/button";
import { SiGithub, SiGoogle } from "@icons-pack/react-simple-icons";
import { MailIcon } from "lucide-react";
import Link from "next/link";
import { LinkText } from "../components/link-text";

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
				<div className="space-y-2">
					<Button asChild variant="link">
						<Link href="/signup/google">
							<SiGoogle className="h-[20px] w-[20px]" />
							<p>Sign up with Google</p>
						</Link>
					</Button>
					{/**<button
							className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
							type="button"
						>
							<Microsoft className="h-5 w-5 mr-2" /> Sign up with Microsoft
						</button>**/}

					<Button asChild variant="link">
						<Link href="/signup/github">
							<SiGithub className="h-[20px] w-[20px]" />
							<p>Sign up with GitHub</p>
						</Link>
					</Button>
				</div>
				<div className="relative">
					<div className="absolute inset-0 flex items-center">
						<div className="w-full border-t border-gray-600" />
					</div>
					<div className="relative flex justify-center text-sm">
						<span className="px-2 bg-navy-900 text-gray-400">or</span>
					</div>
				</div>
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
