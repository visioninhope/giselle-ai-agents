import Link from "next/link";

import { ClickableText } from "@/components/ui/clickable-text";
import { SendIcon } from "lucide-react";
import { ActionPrompt } from "../../components/action-prompt";
import { LegalConsent } from "../../components/legal-consent";
import { SignupForm } from "./signup-form";

export default function Page() {
	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<div className="w-[320px] space-y-8">
				<div className="text-center">
					<h2
						className="mt-6 text-[28px] font-[500] text-primary-100 font-sans text-center"
						style={{ textShadow: "0px 0px 20px #0087F6" }}
					>
						Sign up with Email
					</h2>
					{/* @todo Hide at the time of beta release.
					<p className="mt-2 text-sm text-black-50">
						Free forever. No credit card required.
					</p>
					*/}
				</div>
				<SignupForm />
				<LegalConsent />

				<div className="flex justify-center">
					<ActionPrompt
						prompt="Get started by "
						action={
							<ClickableText asChild>
								<Link href="/signup">other way?</Link>
							</ClickableText>
						}
					/>
				</div>
			</div>
		</div>
	);
}
