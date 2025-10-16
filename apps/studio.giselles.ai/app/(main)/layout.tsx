import { DocsLink } from "@giselle-internal/ui/docs-link";
import Link from "next/link";
import type { ReactNode } from "react";
import { GiselleLogo } from "@/components/giselle-logo";
import { SentryUserWrapper } from "@/components/sentry-user-wrapper";
import { UserButton } from "@/services/accounts/components";
import { TeamSelection } from "@/services/teams/components/team-selection";
import { Nav } from "./nav";

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<SentryUserWrapper>
			<div className="h-screen overflow-y-hidden bg-bg flex flex-col">
				<header className="flex flex-col">
					{/* Top row: Logo, Team Selection, User Icon */}
					<div className="h-[50px] flex items-center px-[24px] justify-between">
						<div className="flex items-center gap-2">
							<Link href="/" aria-label="Giselle logo">
								<GiselleLogo className="w-[70px] h-auto fill-white mt-[4px]" />
							</Link>
							<span className="text-secondary">/</span>
							<TeamSelection />
						</div>
						<div className="flex items-center gap-4">
							<DocsLink
								href="https://docs.giselles.ai/guides/introduction"
								target="_blank"
								rel="noopener noreferrer"
							>
								Docs
							</DocsLink>
							<UserButton />
						</div>
					</div>

					<Nav />
					{/* Border line below navigation */}
					<div className="h-[1px] w-full bg-border" />
				</header>
				<main className="flex-1 overflow-y-auto">{children}</main>
			</div>
		</SentryUserWrapper>
	);
}
