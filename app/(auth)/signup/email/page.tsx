import Link from "next/link";

import { SendIcon } from "lucide-react";
import { SignupForm } from "./signup-form";

export default function Page() {
	return (
		<div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
			<div className="w-[320px] space-y-8">
				<div className="text-center">
					<h2 className="mt-6 text-3xl font-bold text-black-30 font-[Rosart]">
						Create new account
						<br />
						with Email.
					</h2>
					<p className="mt-2 text-sm text-black-50">
						Free forever. No credit card required.
					</p>
				</div>
				<SignupForm />

				<p className="mt-2 text-center text-sm text-gray-400">
					By continuing, you agree to our{" "}
					<Link
						href="/terms"
						className="font-medium text-cyan-300 hover:text-cyan-200"
					>
						Terms of Service
					</Link>{" "}
					and{" "}
					<Link
						href="/privacy"
						className="font-medium text-cyan-300 hover:text-cyan-200"
					>
						Privacy Policy
					</Link>
					.
				</p>

				<p className="text-center text-sm text-gray-400">
					Get started for free by{" "}
					<Link
						href="/signup"
						className="font-medium text-cyan-300 hover:text-cyan-200"
					>
						other way?
					</Link>
				</p>
			</div>
		</div>
	);
}
