import Link from "next/link";
import type { FC } from "react";

export const LegalConsent: FC = () => (
	<p className="font-avenir text-[14px] text-black-70">
		By continuing, you agree to our{" "}
		<Link href="/terms" className="font-[900] underline">
			Terms of Service
		</Link>{" "}
		and{" "}
		<Link href="/privacy" className="font-[900] underline">
			Privacy Policy
		</Link>
		.
	</p>
);
