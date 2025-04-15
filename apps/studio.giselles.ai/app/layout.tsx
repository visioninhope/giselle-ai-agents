import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { GoogleTagManager } from "@next/third-parties/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistSans } from "geist/font/sans";
import { Hubot_Sans } from "next/font/google";
import { Suspense } from "react";
import { PostHogPageView } from "./posthog-page-view";
import { PHProvider } from "./providers";

const title = "Giselle";
const description = "AI for Agentic Workflows. Human-AI Collaboration";
const url = process.env.NEXT_PUBLIC_SITE_URL || "https://studio.giselles.ai";

const hubot = Hubot_Sans({
	weight: "variable",
	variable: "--font-hubot-sans",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title,
	description,
	openGraph: {
		title,
		description,
		url,
		siteName: title,
		images: [
			{
				url: `${url}/og.png`,
				width: 1200,
				height: 600,
			},
		],
		locale: "en_US",
		type: "website",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={`${hubot.variable} ${GeistSans.variable}`}
		>
			<GoogleTagManager gtmId={process.env.GTM_ID ?? ""} />
			<PHProvider>
				<body>
					<ThemeProvider
						attribute="class"
						defaultTheme="dark"
						disableTransitionOnChange
					>
						<Suspense>
							<PostHogPageView />
						</Suspense>
						{children}
					</ThemeProvider>
					<SpeedInsights />
				</body>
			</PHProvider>
		</html>
	);
}
