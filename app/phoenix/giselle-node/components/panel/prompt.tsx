import {
	selectNodeAndSetPanelTab,
	setNodeOutput,
	updateNodeProperty,
	updateNodesUI,
} from "@/app/phoenix/graph/actions";
import { type ThunkAction, useGraph } from "@/app/phoenix/graph/context";
import clsx from "clsx";
import { type FC, useCallback, useMemo, useState } from "react";
import { PanelCloseIcon } from "../../../components/icons/panel-close";
import {
	type GiselleNode,
	type GiselleNodeId,
	giselleNodeCategories,
	panelTabs,
} from "../../types";
import { ArchetypeIcon } from "../archetype-icon";
import { TabTrigger } from "../tabs";

function setTextToPropertyAndOutput(
	nodeId: GiselleNodeId,
	text: string,
): ThunkAction {
	return (dispatch) => {
		dispatch(
			updateNodeProperty({
				node: {
					id: nodeId,
					property: {
						key: "text",
						value: text,
					},
				},
			}),
		);
		dispatch(
			setNodeOutput({
				node: {
					id: nodeId,
					output: text,
				},
			}),
		);
	};
}

type PromptPropertyPanelProps = {
	node: GiselleNode;
};
export const PromptPropertyPanel: FC<PromptPropertyPanelProps> = ({ node }) => {
	const { state, dispatch } = useGraph();
	const outgoingConnections = useMemo(
		() =>
			state.graph.connectors.filter(
				(connector) => connector.source === node.id,
			),
		[state.graph.connectors, node.id],
	);
	const [text, setText] = useState<string>(
		(node.properties?.text as string) ?? "",
	);
	const handleMouseEnter = useCallback(() => {
		dispatch(
			updateNodesUI({
				nodes: outgoingConnections.map((connector) => ({
					id: connector.target,
					ui: {
						isInflluencable: true,
					},
				})),
			}),
		);
	}, [dispatch, outgoingConnections]);

	const handleMouseLeave = useCallback(() => {
		dispatch(
			updateNodesUI({
				nodes: outgoingConnections.map((connector) => ({
					id: connector.target,
					ui: {
						isInflluencable: false,
					},
				})),
			}),
		);
	}, [dispatch, outgoingConnections]);

	const handleBlur = useCallback(
		(event: React.FormEvent<HTMLTextAreaElement>) => {
			event.preventDefault();
			dispatch(setTextToPropertyAndOutput(node.id, text));
		},
		[dispatch, node.id, text],
	);
	const handleClick = useCallback(() => {
		dispatch(
			selectNodeAndSetPanelTab({
				selectNode: {
					id: outgoingConnections[0].target,
					panelTab: panelTabs.result,
				},
			}),
		);
	}, [dispatch, outgoingConnections]);
	return (
		<div className="flex gap-[10px] flex-col h-full">
			<div className="relative z-10 pt-[16px] px-[24px] flex justify-between h-[40px]">
				<button type="button">
					<PanelCloseIcon className="w-[18px] h-[18px] fill-black-30" />
				</button>
				<div className="gap-[16px] flex items-center">
					<TabTrigger value="property">Property</TabTrigger>
					<TabTrigger value="status">Status</TabTrigger>
					<TabTrigger value="result">Result</TabTrigger>
				</div>
			</div>
			<div className="bg-black-80 px-[24px] py-[8px] flex items-center justify-between">
				<div className="flex items-center gap-[8px]">
					<div
						className={clsx(
							"rounded-[2px] flex items-center justify-center px-[4px] py-[4px]",
							node.category === giselleNodeCategories.action &&
								"bg-[hsla(187,71%,48%,1)]",
							node.category === giselleNodeCategories.instruction && "bg-white",
						)}
					>
						<ArchetypeIcon
							archetype={node.archetype}
							className="w-[14px] h-[14px] fill-black-100"
						/>
					</div>
					<div className="font-avenir text-[16px] text-black-30">
						{node.archetype}
					</div>
				</div>
				<div className="">
					<div className="absolute rounded-[8px] inset-0 border mask-fill bg-gradient-to-br bg-origin-border bg-clip-boarder border-transparent from-[hsla(233,4%,37%,1)] to-[hsla(233,62%,22%,1)]" />
					<button
						type="button"
						className="relative z-10 rounded-[8px] shadow-[0px_0px_3px_0px_#FFFFFF40_inset] py-[4px] px-[8px] bg-black-80 text-black-30 font-rosart text-[14px] disabled:bg-black-40"
						disabled={text.length === 0}
						onMouseEnter={handleMouseEnter}
						onMouseLeave={handleMouseLeave}
						onClick={handleClick}
					>
						Push Value
					</button>
				</div>
			</div>

			{node.ui.panelTab === panelTabs.property && (
				<div className="px-[24px] pb-[16px] overflow-scroll">
					<div>
						<div className="relative z-10">
							<div className="grid gap-[8px]">
								<label
									htmlFor="text"
									className="font-rosart text-[16px] text-black-30"
								>
									Text
								</label>
								<textarea
									name="text"
									id="text"
									className="w-full text-[14px] h-[200px] bg-[hsla(222,21%,40%,0.3)] rounded-[8px] text-white p-[14px] font-rosart outline-none resize-none"
									onBlur={handleBlur}
									value={text}
									onChange={(event) => {
										setText(event.target.value);
									}}
								/>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
