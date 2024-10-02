import * as Popover from "@radix-ui/react-popover";
import clsx from "clsx";
import { CheckIcon, CirclePlusIcon } from "lucide-react";
import { type FC, useCallback, useMemo, useState } from "react";
import type { Artifact, ArtifactId } from "../../../artifact/types";
import { PanelCloseIcon } from "../../../components/icons/panel-close";
import {
	generateText,
	selectNodeAndSetPanelTab,
	setNodeOutput,
	updateNodeProperty,
	updateNodesUI,
} from "../../../graph/actions";
import { type ThunkAction, useGraph } from "../../../graph/context";
import {
	type GiselleNode,
	type GiselleNodeId,
	giselleNodeCategories,
	panelTabs,
} from "../../types";
import { ArchetypeIcon } from "../archetype-icon";
import { TabTrigger } from "../tabs";
import { ArtifactBlock } from "./artifact-block";

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
			updateNodesUI({
				nodes: outgoingConnections.map((connector) => ({
					id: connector.target,
					ui: {
						isInflluencable: false,
					},
				})),
			}),
		);
		dispatch(
			selectNodeAndSetPanelTab({
				selectNode: {
					id: outgoingConnections[0].target,
					panelTab: panelTabs.result,
				},
			}),
		);
		dispatch(
			generateText({
				textGeneratorNode: {
					id: outgoingConnections[0].target,
				},
			}),
		);
	}, [dispatch, outgoingConnections]);

	const availableArtifacts = useMemo<Artifact[]>(
		() =>
			state.graph.artifacts.filter(
				(artifact) =>
					!outgoingConnections.some(
						({ target }) => target === artifact.generatorNode.id,
					),
			),
		[outgoingConnections, state.graph.artifacts],
	);
	const sources = useMemo<Artifact[]>(
		() =>
			(node.properties.sources as ArtifactId[])
				?.map((source) =>
					state.graph.artifacts.find((artifact) => artifact.id === source),
				)
				.filter((artifactIdsOrNull) => artifactIdsOrNull != null) ?? [],
		[node.properties.sources, state.graph.artifacts],
	);
	const handleArtifactClick = useCallback(
		(artifact: Artifact) => () => {
			const artifactIds = sources.map(({ id }) => id);
			dispatch(
				updateNodeProperty({
					node: {
						id: node.id,
						property: {
							key: "sources",
							value: artifactIds.includes(artifact.id)
								? artifactIds.filter((artifactId) => artifactId !== artifact.id)
								: [...artifactIds, artifact.id],
						},
					},
				}),
			);
		},
		[dispatch, node.id, sources],
	);
	return (
		<div className="flex gap-[10px] flex-col h-full">
			<div className="relative z-10 pt-[16px] px-[24px] flex justify-between h-[40px]">
				<button type="button">
					<PanelCloseIcon className="w-[18px] h-[18px] fill-black-30" />
				</button>
				<div className="gap-[16px] flex items-center">
					<TabTrigger value="property">Property</TabTrigger>
				</div>
			</div>
			<div className="bg-black-80 px-[24px] flex items-center justify-between  h-[48px]">
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
				<div className="px-[16px] pb-[16px] overflow-y-auto">
					<div>
						<div className="relative z-10 flex flex-col gap-[10px]">
							<div className="grid gap-[8px] pb-[14px]">
								<label
									htmlFor="text"
									className="font-rosart text-[16px] text-black-30"
								>
									Instruction
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

							<div className="border-t -mx-[24px] border-[hsla(222,21%,40%,1)]" />
							<div className="grid gap-[8px]">
								<div className="flex justify-between">
									<div className="font-rosart text-[16px] text-black-30">
										Sources
									</div>
									<Popover.Root>
										<Popover.Trigger asChild>
											<button type="button">
												<CirclePlusIcon
													size={20}
													className="stroke-black-100 fill-black-30"
												/>
											</button>
										</Popover.Trigger>
										<Popover.Content
											side={"top"}
											align="end"
											className="rounded-[16px] p-[8px] text-[14px] w-[200px] text-black-30 bg-black-100 border border-[hsla(222,21%,40%,1)] shadow-[0px_0px_2px_0px_hsla(0,_0%,_100%,_0.1)_inset] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
											sideOffset={5}
										>
											<div className="px-[8px]">
												<div>
													{availableArtifacts.map((artifact) => (
														<button
															type="button"
															className="flex justify-between items-center py-[4px] w-full"
															key={artifact.id}
															onClick={handleArtifactClick(artifact)}
														>
															<p className="line-clamp-1 text-left">
																{artifact.title}
															</p>
															{sources.some(
																(source) => source.id === artifact.id,
															) && (
																<CheckIcon
																	size={16}
																	className="stroke-white flex-shrink-0"
																/>
															)}
														</button>
													))}
												</div>
											</div>
										</Popover.Content>
									</Popover.Root>
								</div>
								<div className="grid grid-cols-2 gap-4">
									{sources.map((source) => (
										<ArtifactBlock
											key={source.id}
											title={source.title}
											node={source.generatorNode}
										/>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
