import Link from "next/link";
import type { FC } from "react";

export const LegalConsent: FC = () => (
	<p className="font-geist text-[14px] text-black-70">
		By continuing, you agree to our{" "}
		<Link
			href="https://giselles.ai/legal/terms"
			className="font-[700] underline font-geist"
		>
			Terms of Service
		</Link>{" "}
		and{" "}
		<Link
			href="https://giselles.ai/legal/privacy"
			className="font-[700] underline font-geist"
		>
			Privacy Policy
		</Link>
		.
	</p>
);
