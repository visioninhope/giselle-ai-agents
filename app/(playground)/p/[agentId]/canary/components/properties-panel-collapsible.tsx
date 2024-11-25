import { ChevronsUpDownIcon, Minimize2Icon } from "lucide-react";
import { type ReactNode, useState } from "react";

interface PropertiesPanelCollapsible {
	title: string;
	glanceLabel?: string;
	children: ReactNode;
}

export function PropertiesPanelCollapsible({
	title,
	glanceLabel,
	children,
}: PropertiesPanelCollapsible) {
	const [isExpanded, setIsExpanded] = useState(false);

	return (
		<>
			{isExpanded ? (
				<div className="px-6 text-base text-black-30 py-2 grid gap-2">
					<div className="flex justify-between items-center">
						<p className="font-rosart">{title}</p>
						<button type="button" onClick={() => setIsExpanded(false)}>
							<Minimize2Icon
								size={16}
								className="text-black-50 hover:text-black-30"
							/>
						</button>
					</div>
					{children}
				</div>
			) : (
				<button
					type="button"
					className="px-6 text-base text-black-30 flex justify-between items-center py-2 group"
					onClick={() => setIsExpanded(true)}
				>
					<div className="flex gap-2 items-center">
						<p className="font-rosart">{title}</p>
						{glanceLabel && (
							<span className="text-[10px] text-black-50">{glanceLabel}</span>
						)}
					</div>
					<ChevronsUpDownIcon
						size={16}
						className="text-black-50 group-hover:text-black-30"
					/>
				</button>
			)}
		</>
	);
}
