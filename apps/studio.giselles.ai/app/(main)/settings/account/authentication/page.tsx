import { DocsLink } from "@giselle-internal/ui/docs-link";
import { PageHeading } from "@giselle-internal/ui/page-heading";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { GitHubAuthentication } from "../github-authentication";
import { GoogleAuthentication } from "../google-authentication";

export default function AccountAuthenticationPage({
	searchParams,
}: {
	// On the server, Next passes a plain object; in edge it may be a Promise.
	searchParams?:
		| Record<string, string | string[]>
		| Promise<Record<string, string | string[]>>;
}) {
	// Normalize both sync and promise cases
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const sp = (searchParams as any) ?? {};
	const oauthError =
		typeof sp?.oauthError === "string" ? sp.oauthError : undefined;
	return (
		<div className="flex flex-col gap-[12px]">
			<div className="flex items-center justify-between">
				<PageHeading as="h1" glow>
					Authentication
				</PageHeading>
				<DocsLink
					href="https://docs.giselles.ai/en/guides/settings/account/authentication"
					target="_blank"
					rel="noopener noreferrer"
				>
					About authentication
				</DocsLink>
			</div>
			<p className="text-secondary text-[12px] leading-[20.4px] tracking-normal font-geist">
				Connect your Giselle Account with a third-party service to use it for
				login.
			</p>
			{oauthError && (
				<div className="text-error-900 bg-error-900/12 border border-error-900/40 rounded-[12px] p-3 text-[12px] font-geist">
					OAuth Error: {oauthError}
				</div>
			)}
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
