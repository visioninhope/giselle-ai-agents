import {
	type FileNode,
	LLM,
	LLMString,
	type Node,
	type TextGenerationNode,
	type TextNode,
	createConnectionHandle,
} from "@giselle-sdk/data-type";
import clsx from "clsx/lite";
import { useWorkflowDesigner } from "giselle-sdk/react";
import { CheckIcon, TrashIcon, UndoIcon } from "lucide-react";
import {
	type DetailedHTMLProps,
	useCallback,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";
import { Block } from "../../../ui/block";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "../../../ui/select";
import { Slider } from "../../../ui/slider";
import { PropertiesPanelCollapsible } from "../ui/collapsible";
import { PropertiesPanelContentBox } from "../ui/content-box";
import { NodeDropdown } from "../ui/node-dropdown";

export function TabsContentPrompt({
	node: textGenerationNode,
}: {
	node: TextGenerationNode;
}) {
	const {
		data,
		updateNodeDataContent,
		addConnection,
		deleteConnection,
		llmProviders,
	} = useWorkflowDesigner();

	const [cursorPosition, setCursorPosition] = useState(0);
	const promptTextAreaRef = useRef<HTMLTextAreaElement | null>(null);

	const handleControlledSelect = useCallback(() => {
		setCursorPosition(promptTextAreaRef.current?.selectionStart ?? 0);
	}, []);

	// Function to insert text at cursor position (controlled)
	const insertSourceToPrompt = useCallback(
		(sourceNode: Node) => {
			if (promptTextAreaRef.current === null) {
				return;
			}
			const before = textGenerationNode.content.prompt.slice(0, cursorPosition);
			const after = textGenerationNode.content.prompt.slice(cursorPosition);
			const tagedId = `{{${sourceNode.id}}}`;

			const insertedText = `${before}${tagedId}${after}`;
			promptTextAreaRef.current.value = insertedText;
			updateNodeDataContent(textGenerationNode, {
				prompt: insertedText,
			});
			const newCursorPosition = cursorPosition + tagedId.length;
			promptTextAreaRef.current.selectionStart = newCursorPosition;
			promptTextAreaRef.current.selectionEnd = newCursorPosition;
			setCursorPosition(newCursorPosition);
		},
		[cursorPosition, updateNodeDataContent, textGenerationNode],
	);

	const addSource = useCallback(
		(sourceNode: Node) => {
			const connectionHandle = createConnectionHandle({
				label: "Source",
				nodeId: textGenerationNode.id,
				nodeType: textGenerationNode.type,
				connectedNodeId: sourceNode.id,
			});
			addConnection(sourceNode, connectionHandle);
			connectionHandle;
			updateNodeDataContent(textGenerationNode, {
				sources: [...textGenerationNode.content.sources, connectionHandle],
			});
		},
		[addConnection, textGenerationNode, updateNodeDataContent],
	);

	const removeSource = useCallback(
		(removeSourceNode: Node) => {
			for (const connection of data.connections) {
				if (
					connection.sourceNodeId !== removeSourceNode.id ||
					connection.targetNodeId !== textGenerationNode.id
				) {
					continue;
				}
				deleteConnection(connection.id);
				updateNodeDataContent(textGenerationNode, {
					sources: textGenerationNode.content.sources.filter(
						({ id }) => id !== connection.targetNodeHandleId,
					),
				});
				break;
			}
		},
		[deleteConnection, data, textGenerationNode, updateNodeDataContent],
	);

	const connectableTextNodes = useMemo(
		() =>
			data.nodes
				.filter(
					(node) =>
						node.content.type === "text" && node.id !== textGenerationNode.id,
				)
				.map((node) => node as TextNode),
		[data, textGenerationNode],
	);
	const connectableTextGeneratorNodes = useMemo(
		() =>
			data.nodes
				.filter(
					(node) =>
						node.content.type === "textGeneration" &&
						node.id !== textGenerationNode.id,
				)
				.map((node) => node as TextGenerationNode),
		[data, textGenerationNode],
	);
	const connectableFileNodes = useMemo(
		() =>
			data.nodes
				.filter(
					(node) =>
						node.content.type === "file" && node.id !== textGenerationNode.id,
				)
				.map((node) => node as FileNode),
		[data, textGenerationNode],
	);
	const sourceNodes = useMemo(
		() =>
			textGenerationNode.content.sources
				.map((source) =>
					data.nodes.find((node) => node.id === source.connectedNodeId),
				)
				.filter((node) => node !== undefined),
		[data, textGenerationNode.content.sources],
	);
	return (
		<>
			<PropertiesPanelCollapsible
				title="LLM"
				glanceLabel={LLMString.parse(textGenerationNode.content.llm)}
			>
				<div className="flex flex-col gap-[10px]">
					<div className="grid gap-[8px]">
						<Select
							value={LLMString.parse(textGenerationNode.content.llm)}
							onValueChange={(value) => {
								updateNodeDataContent(textGenerationNode, {
									llm: LLM.parse(value),
								});
							}}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select a LLM" />
							</SelectTrigger>
							<SelectContent>
								{llmProviders.includes("openai") && (
									<SelectGroup>
										<SelectLabel>OpenAI</SelectLabel>
										<SelectItem value="openai:gpt-4o">gpt-4o</SelectItem>
										<SelectItem value="openai:o1-mini">o1-mini</SelectItem>
										<SelectItem value="openai:o1-preview">
											o1-preview
										</SelectItem>
									</SelectGroup>
								)}
								{llmProviders.includes("anthropic") && (
									<SelectGroup>
										<SelectLabel>Anthropic </SelectLabel>
										<SelectItem value="anthropic:claude-3-5-sonnet-latest">
											Claude 3.5 Sonnet
										</SelectItem>
									</SelectGroup>
								)}
								{llmProviders.includes("google") && (
									<SelectGroup>
										<SelectLabel>Google</SelectLabel>
										<SelectItem value="google:gemini-1.5-flash">
											Gemini 1.5 Flash
										</SelectItem>
										<SelectItem value="google:gemini-1.5-pro">
											Gemini 1.5 Pro
										</SelectItem>
										<SelectItem value="google:gemini-2.0-flash-exp">
											Gemini 2.0 Flash Exp
										</SelectItem>
									</SelectGroup>
								)}
								{/* {developerMode && (
									<SelectGroup>
										<SelectLabel>Development</SelectLabel>
										<SelectItem value="dev:error">
											Mock(Raise an error)
										</SelectItem>
									</SelectGroup>
								)} */}
							</SelectContent>
						</Select>
					</div>
					<div className="grid gap-[8px]">
						<div className="font-rosart text-[16px] text-black-30">
							Parameters
						</div>
						<div className="grid gap-[16px]">
							<Slider
								label="Temperature"
								value={textGenerationNode.content.temperature}
								max={2.0}
								min={0.0}
								step={0.01}
								onChange={(value) => {
									updateNodeDataContent(textGenerationNode, {
										temperature: value,
									});
								}}
							/>
						</div>
						<Slider
							label="Top P"
							value={textGenerationNode.content.topP}
							max={1.0}
							min={0.0}
							step={0.01}
							onChange={(value) => {
								updateNodeDataContent(textGenerationNode, {
									topP: value,
								});
							}}
						/>
					</div>
				</div>
			</PropertiesPanelCollapsible>

			<div className="border-t border-[hsla(222,21%,40%,1)]" />

			<PropertiesPanelCollapsible
				title="Sources"
				glanceLabel={
					sourceNodes.length < 1
						? "No sources"
						: `${sourceNodes.length} sources selected`
				}
			>
				{sourceNodes.length < 1 ? (
					<div className="flex items-center gap-[4px]">
						<div className="py-[4px] text-[12px] flex-1">Not selected</div>
						<NodeDropdown
							triggerLabel="add"
							nodes={[
								...connectableTextNodes,
								...connectableTextGeneratorNodes,
								...connectableFileNodes,
							]}
							onValueChange={(node) => {
								addSource(node);
							}}
						/>
					</div>
				) : (
					<div className="grid gap-2">
						{sourceNodes.map((sourceNode) => (
							<Block
								key={sourceNode.id}
								hoverCardContent={
									<div className="flex justify-between space-x-4">
										node type: {sourceNode.content.type}
										{sourceNode.content.type === "text" && (
											<div className="line-clamp-5 text-[14px]">
												{sourceNode.content.text}
											</div>
										)}
									</div>
								}
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-[8px]">
										<p className="truncate text-[14px] font-rosart">
											{sourceNode.name}
										</p>
									</div>
									<button
										type="button"
										className="group-hover:block hidden p-[2px] hover:bg-black-70 rounded-[4px]"
										onClick={() => {
											removeSource(sourceNode);
										}}
									>
										<TrashIcon className="w-[16px] h-[16px] text-black-30" />
									</button>
								</div>
							</Block>
						))}

						<div className="flex items-center gap-[4px]">
							<NodeDropdown
								triggerLabel="add"
								nodes={[
									...connectableTextNodes,
									...connectableTextGeneratorNodes,
									...connectableFileNodes,
								]}
								onValueChange={(node) => {
									addSource(node);
								}}
							/>
						</div>
					</div>
				)}
			</PropertiesPanelCollapsible>

			<div className="border-t border-[hsla(222,21%,40%,1)]" />

			<PropertiesPanelContentBox className="flex flex-col gap-[8px] flex-1">
				<div className="flex justify-between">
					<label
						htmlFor="text"
						className="font-rosart text-[16px] text-black-30"
					>
						Instruction
					</label>
					<NodeDropdown
						triggerLabel="Insert source"
						nodes={sourceNodes}
						onValueChange={(node) => {
							insertSourceToPrompt(node);
						}}
					/>
				</div>
				<textarea
					name="text"
					id="text"
					className="w-full text-[14px] bg-[hsla(222,21%,40%,0.3)] rounded-[8px] text-white p-[14px] font-rosart outline-none resize-none flex-1 mb-[16px]"
					defaultValue={textGenerationNode.content.prompt}
					onChange={(event) => {
						updateNodeDataContent(textGenerationNode, {
							prompt: event.target.value,
						});
					}}
					ref={promptTextAreaRef}
					onSelect={handleControlledSelect}
					onClick={handleControlledSelect}
					onKeyUp={handleControlledSelect}
				/>
			</PropertiesPanelContentBox>
		</>
	);
}

interface SystemPromptTextareaProps
	extends Pick<
		DetailedHTMLProps<
			React.TextareaHTMLAttributes<HTMLTextAreaElement>,
			HTMLTextAreaElement
		>,
		"defaultValue" | "className"
	> {
	onValueChange?: (value: string) => void;
	onRevertToDefault?: () => void;
	revertValue?: string;
}
export function SystemPromptTextarea({
	defaultValue,
	className,
	onValueChange,
	onRevertToDefault,
	revertValue,
}: SystemPromptTextareaProps) {
	const id = useId();
	return (
		<div className={clsx("relative", className)}>
			<textarea
				className="w-full text-[14px] bg-[hsla(222,21%,40%,0.3)] rounded-[8px] text-white p-[14px] font-rosart outline-none resize-none h-full"
				defaultValue={defaultValue}
				ref={(ref) => {
					if (ref === null) {
						return;
					}
					ref.dataset.refId = id;

					function handleBlur() {
						if (ref === null) {
							return;
						}
						if (defaultValue !== ref.value) {
							onValueChange?.(ref.value);
						}
					}
					ref.addEventListener("blur", handleBlur);
					return () => {
						ref.removeEventListener("blur", handleBlur);
					};
				}}
			/>

			<div className="absolute bottom-[4px] right-[4px]">
				<RevertToDefaultButton
					onClick={() => {
						onRevertToDefault?.();
						const textarea = document.querySelector(
							`textarea[data-ref-id="${id}"]`,
						);
						if (
							revertValue !== undefined &&
							textarea !== null &&
							textarea instanceof HTMLTextAreaElement
						) {
							textarea.value = revertValue;
						}
					}}
				/>
			</div>
		</div>
	);
}

function RevertToDefaultButton({ onClick }: { onClick: () => void }) {
	const [clicked, setClicked] = useState(false);

	const handleClick = useCallback(() => {
		onClick();
		setClicked(true);
		setTimeout(() => setClicked(false), 2000);
	}, [onClick]);

	return (
		<button
			type="button"
			className="group flex items-center bg-black-100/30 text-white px-[8px] py-[2px] rounded-md transition-all duration-300 ease-in-out hover:bg-black-100"
			onClick={handleClick}
		>
			<div className="relative h-[12px] w-[12px]">
				<span
					className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${clicked ? "opacity-0" : "opacity-100"}`}
				>
					<UndoIcon className="h-[12px] w-[12px]" />
				</span>
				<span
					className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${clicked ? "opacity-100" : "opacity-0"}`}
				>
					<CheckIcon className="h-[12px] w-[12px]" />
				</span>
			</div>
			<div
				className="overflow-hidden transition-all duration-300 ease-in-out w-0 data-[clicked=false]:group-hover:w-[98px] data-[clicked=true]:group-hover:w-[40px] group-hover:ml-[4px] flex"
				data-clicked={clicked}
			>
				<span className="whitespace-nowrap text-[12px]">
					{clicked ? "Revert!" : "Revert to Default"}
				</span>
			</div>
		</button>
	);
}
