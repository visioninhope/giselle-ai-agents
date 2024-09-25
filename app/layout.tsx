import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { GTM_ID } from "@/lib/constants";
import { GoogleTagManager } from "@next/third-parties/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { rosart } from "./fonts";

export const metadata: Metadata = {
	title: "un-name",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<GoogleTagManager gtmId={GTM_ID} />
			<body className={`${rosart.variable} font-sans`}>
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					disableTransitionOnChange
				>
					{children}
				</ThemeProvider>
				<SpeedInsights />
			</body>
		</html>
	);
}
