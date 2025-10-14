import { DocsLink } from "@giselle-internal/ui/docs-link";
import { PageHeading } from "@giselle-internal/ui/page-heading";
import { ExternalLink } from "lucide-react";
import { SignOutButton } from "@/services/accounts/components/user-button/sign-out-button";
import { Button } from "../../components/button";
import { Card } from "../../components/card";
import { Field } from "../../components/field";
import { AccountDisplayNameForm } from "../account-display-name-form";
import { getAccountInfo } from "../actions";

export default async function AccountGeneralPage() {
	const { displayName, email, avatarUrl } = await getAccountInfo();
	const alt = displayName || email || "";

	return (
		<div className="flex flex-col gap-[24px]">
			<div className="flex justify-between items-center">
				<PageHeading
					as="h3"
					glow
					className="text-[28px] leading-[28px] tracking-[-0.011em]"
				>
					Account Settings
				</PageHeading>
				<DocsLink href="https://docs.giselles.ai/guides/settings/account/general">
					About Account Settings
				</DocsLink>
			</div>
			<div className="flex flex-col gap-y-4">
				<AccountDisplayNameForm
					displayName={displayName}
					avatarUrl={avatarUrl}
					alt={alt}
				/>
				<div className="flex flex-col gap-y-2">
					<Field
						label="*Email address (required)"
						name="email"
						type="email"
						value={email ?? "No email"}
						disabled
					/>
					<p className="text-secondary text-[12px] leading-[16px] font-geist">
						This email will be used for account-related notifications.
					</p>
				</div>
				<Card
					title="Session"
					description="Log out of all sessions."
					className="flex flex-row justify-between items-center gap-y-6"
				>
					<SignOutButton asChild>
						<Button variant="link">Log Out</Button>
					</SignOutButton>
				</Card>
			</div>
		</div>
	);
}
