import type { ReactNode } from "react";
import { SentryUserWrapper } from "@/components/sentry-user-wrapper";
import { Header } from "./components/header";

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<SentryUserWrapper>
			<div className="h-screen overflow-y-hidden bg-bg flex flex-col">
				<Header />
				<main className="flex-1 overflow-y-auto">{children}</main>
			</div>
		</SentryUserWrapper>
	);
}
