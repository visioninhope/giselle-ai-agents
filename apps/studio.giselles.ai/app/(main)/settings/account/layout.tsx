import { ExternalLink } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export default async function SettingsAccountLayout({
	children,
}: { children: ReactNode }) {
	return (
		<div className="flex justify-center h-full">
			<div className="flex h-full max-w-[1200px] w-full divide-x divide-black-80">
				{/* Left Sidebar */}
				<div className="w-[240px] min-h-full bg-black-900 p-[24px] flex flex-col">
					{/* Menu Items */}
					<div className="flex flex-col space-y-4">
						<Link
							href="/settings/account"
							className="text-white-400 hover:text-white-100 text-[16px] font-hubot font-medium py-1"
						>
							Overview
						</Link>
						<Link
							href="/settings/account/general"
							className="text-black-70 hover:text-white-100 text-[16px] font-hubot font-medium py-1"
						>
							General
						</Link>
						<Link
							href="/settings/account/authentication"
							className="text-black-70 hover:text-white-100 text-[16px] font-hubot font-medium py-1"
						>
							Authentication
						</Link>
					</div>
				</div>

				{/* Main Content */}
				<div className="p-[24px] flex-1 bg-black-900">{children}</div>
			</div>
		</div>
	);
}
