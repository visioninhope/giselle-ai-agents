"use client";

import { useState } from "react";

export default function StageShowcasePage() {
	const [activeTab, setActiveTab] = useState<"Apps" | "Playlist" | "History">(
		"Apps",
	);

	return (
		<div className="flex-1 px-[24px] bg-[var(--color-stage-background)] pt-16 md:pt-0 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0 h-full flex flex-col">
			<div className="py-6 h-full flex flex-col">
				<div className="flex items-center justify-between px-1 mb-6">
					<div>
						<h1
							className="text-[30px] font-sans font-medium text-[hsl(192,73%,84%)] mb-2"
							style={{
								textShadow:
									"0 0 20px #0087f6, 0 0 40px #0087f6, 0 0 60px #0087f6",
							}}
						>
							Showcase
						</h1>
						<p className="text-sm text-black-400">
							Explore featured workflows and inspiring examples
						</p>
					</div>
				</div>

				{/* Tabs */}
				<div className="mb-8">
					<div className="flex items-center px-0 py-0 border-t border-black-900/50">
						<div className="flex items-center space-x-[12px]">
							{["Apps", "Playlist", "History"].map((tab) => {
								const isActive = activeTab === tab;
								return (
									<button
										key={tab}
										type="button"
										onClick={() =>
											setActiveTab(tab as "Apps" | "Playlist" | "History")
										}
										className={`text-[16px] font-sans font-medium transition-colors px-2 py-2 relative rounded-md
                    ${
											isActive
												? "text-primary-100 [text-shadow:0px_0px_20px_#0087f6] after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[2px] after:bg-primary-100"
												: "text-black-70 hover:text-white-100 hover:after:content-[''] hover:after:absolute hover:after:left-0 hover:after:right-0 hover:after:bottom-0 hover:after:h-[2px] hover:after:bg-primary-100"
										}`}
									>
										{tab}
									</button>
								);
							})}
						</div>
					</div>
				</div>

				{/* Content area */}
				<div className="flex-1">
					{activeTab === "Apps" && (
						<div className="flex justify-center items-center h-full">
							<div className="grid gap-[8px] justify-center text-center">
								<h3 className="text-[18px] font-geist font-bold text-black-400">
									No apps yet.
								</h3>
								<p className="text-[12px] font-geist text-black-400">
									Please create a new app with the 'New App +' button.
								</p>
							</div>
						</div>
					)}

					{activeTab === "Playlist" && (
						<div className="flex justify-center items-center h-full">
							<div className="grid gap-[8px] justify-center text-center">
								<h3 className="text-[18px] font-geist font-bold text-black-400">
									No playlists yet.
								</h3>
								<p className="text-[12px] font-geist text-black-400">
									Please create a new playlist with the 'New Playlist +' button.
								</p>
							</div>
						</div>
					)}

					{activeTab === "History" && (
						<div className="flex justify-center items-center h-full">
							<div className="grid gap-[8px] justify-center text-center">
								<h3 className="text-[18px] font-geist font-bold text-black-400">
									No history yet.
								</h3>
								<p className="text-[12px] font-geist text-black-400">
									Please create a new workflow to see your history.
								</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
