import { ClickableText } from "@/components/ui/clicable-text";
import Link from "next/link";
import type { FC } from "react";

export const LegalConsent: FC = () => (
	<p className="text-xs text-white-400 text-center font-hubot">
		By continuing, you agree to our{" "}
		<ClickableText asChild>
			<Link href="/terms">Terms of Service</Link>
		</ClickableText>{" "}
		and{" "}
		<ClickableText asChild>
			<Link href="/privacy">Privacy Policy</Link>
		</ClickableText>
		.
	</p>
);
