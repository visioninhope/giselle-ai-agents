import { ExternalLink } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export default async function SettingsAccountLayout({
	children,
}: { children: ReactNode }) {
	return (
		<div className="flex h-full divide-x divide-black-80">
			{/* Left Sidebar */}
			<div className="w-[240px] h-full bg-black-900 p-[24px] flex flex-col">
				<div className="mb-8">
					<h3 className="text-white-400 text-[18px] font-medium font-hubot mb-4">Account Reference</h3>
				</div>
				
				{/* Menu Items */}
				<div className="flex flex-col space-y-3">
					<Link 
						href="/settings/account"
						className="text-black-70 hover:text-white-100 text-[16px] font-hubot font-medium py-1"
					>
						Overview
					</Link>
					<Link 
						href="https://docs.giselles.ai/guides/account"
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-1.5 text-black-70 hover:text-white-100 text-[16px] font-hubot font-medium py-1"
					>
						User Guide
						<ExternalLink size={14} />
					</Link>
				</div>
			</div>

			{/* Main Content */}
			<div className="p-[24px] flex-1 bg-black-900 max-w-[1200px] mx-auto">
				{children}
			</div>
		</div>
	);
}
