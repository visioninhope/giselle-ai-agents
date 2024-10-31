import { SpinnerIcon } from "../../components/icons/spinner";
import { type Step, stepStatuses } from "../../flow/types";
import { ArchetypeIcon } from "../../giselle-node/components/archetype-icon";
import type { GiselleNode } from "../../giselle-node/types";

interface ActionItemProps {
	action: Step;
	node: GiselleNode;
}
export function ActionItem(props: ActionItemProps) {
	return (
		<div className="flex items-center gap-[8px]">
			{(props.action.status === stepStatuses.running ||
				props.action.status === stepStatuses.queued) && (
				<SpinnerIcon className="w-[18px] h-[18px] stroke-black-30 animate-follow-through-spin fill-transparent" />
			)}
			{props.action.status === stepStatuses.completed && (
				<ArchetypeIcon
					archetype={props.node.archetype}
					className="w-[18px] h-[18px] fill-white"
				/>
			)}

			<div className="flex flex-col">
				<p className="truncate text-[14px] font-rosart">
					{props.node.archetype}
				</p>
				<p className="line-clamp-1 font-rosart text-black-70 text-[8px]">
					{props.node.name} / {props.action.status}
				</p>
				{(props.action.status === stepStatuses.running ||
					props.action.status === stepStatuses.completed) && (
					<p className="line-clamp-1 font-rosart text-black-70 text-[8px]">
						output:{" "}
						{(typeof props.action.output === "object" &&
							JSON.stringify(props.action.output)) ||
							(props.action.output as string)}
					</p>
				)}
			</div>
		</div>
	);
}
