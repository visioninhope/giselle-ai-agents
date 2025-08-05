import { StepLayout } from "./[stepId]/ui/step-layout";

export default function Loading() {
	return (
		<StepLayout
			header={
				<div className="flex items-center gap-[6px]">
					<div className="p-[8px] bg-element-active rounded-[4px]">
						<div className="size-[16px] bg-gray-600 rounded animate-pulse" />
					</div>
					<div className="flex flex-col gap-[4px]">
						<div className="w-32 h-[14px] bg-gray-600 rounded animate-pulse" />
						<div className="flex items-center gap-[4px]">
							<div className="w-12 h-[10px] bg-gray-600 rounded animate-pulse" />
							<div className="size-[2px] rounded-full bg-gray-600 animate-pulse" />
							<div className="w-24 h-[10px] bg-gray-600 rounded animate-pulse" />
						</div>
					</div>
				</div>
			}
		>
			{/* Skeleton for GenerationView content */}
			<div className="space-y-[16px]">
				{/* Main content blocks */}
				<div className="space-y-[8px]">
					<div className="w-full h-[20px] bg-gray-600 rounded animate-pulse" />
					<div className="w-5/6 h-[20px] bg-gray-600 rounded animate-pulse" />
					<div className="w-4/5 h-[20px] bg-gray-600 rounded animate-pulse" />
				</div>

				{/* Accordion-style skeleton for reasoning sections */}
				<div className="space-y-[8px]">
					<div className="flex items-center gap-[4px]">
						<div className="size-[16px] bg-gray-600 rounded animate-pulse" />
						<div className="w-20 h-[12px] bg-gray-600 rounded animate-pulse" />
					</div>
					<div className="ml-[20px] pl-[12px] border-l border-l-gray-600/20 space-y-[4px]">
						<div className="w-full h-[14px] bg-gray-600 rounded animate-pulse" />
						<div className="w-3/4 h-[14px] bg-gray-600 rounded animate-pulse" />
						<div className="w-5/6 h-[14px] bg-gray-600 rounded animate-pulse" />
					</div>
				</div>

				{/* More content blocks */}
				<div className="space-y-[8px]">
					<div className="w-full h-[20px] bg-gray-600 rounded animate-pulse" />
					<div className="w-3/4 h-[20px] bg-gray-600 rounded animate-pulse" />
				</div>
			</div>
		</StepLayout>
	);
}
