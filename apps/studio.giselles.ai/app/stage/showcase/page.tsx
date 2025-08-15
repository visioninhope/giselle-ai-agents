import { notFound } from "next/navigation";

import { stageFlag } from "@/flags";

export default async function StageShowcasePage() {
	const enableStage = await stageFlag();
	if (!enableStage) {
		return notFound();
	}

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

				{/* Content area */}
				<div className="flex flex-col items-center justify-center h-full text-center">
					<div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mb-4">
						<span className="text-2xl text-gray-400">✨</span>
					</div>
					<h2 className="text-lg font-medium text-white-100 mb-2">
						Coming Soon
					</h2>
					<p className="text-sm text-white-700 mb-6 max-w-sm">
						We're preparing amazing showcases for you to explore.
					</p>
				</div>
			</div>
		</div>
	);
}
