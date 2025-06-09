import type { Metadata } from "next";
import "./globals.css";
import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
	weight: "variable",
	variable: "--font-dm-sans",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Giselle / Playground",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={dmSans.variable}>
			<body>{children}</body>
		</html>
	);
}
