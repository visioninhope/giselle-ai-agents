import { Suspense } from "react";
import { PageHeading } from "@giselle-internal/ui/page-heading";
import { DocsLink } from "@giselle-internal/ui/docs-link";
import { Skeleton } from "@/components/ui/skeleton";
import { GitHubAuthentication } from "../github-authentication";
import { GoogleAuthentication } from "../google-authentication";

export default function AccountAuthenticationPage() {
	return (
		<div className="flex flex-col gap-[12px]">
			<div className="flex items-center justify-between">
				<PageHeading as="h1" glow>
					Authentication
				</PageHeading>
				<DocsLink href="https://docs.giselles.ai/guides/settings/account/authentication" />
			</div>
			<p className="text-secondary text-[12px] leading-[20.4px] tracking-normal font-geist">
				Connect your Giselle Account with a third-party service to use it for
				login.
			</p>
			<div className="flex flex-col gap-y-4">
				<Suspense
					fallback={
						<Skeleton className="rounded-md border border-border-muted w-full h-16" />
					}
				>
					<GoogleAuthentication />
				</Suspense>
				<Suspense
					fallback={
						<Skeleton className="rounded-md border border-border-muted w-full h-16" />
					}
				>
					<GitHubAuthentication />
				</Suspense>
			</div>
		</div>
	);
}
