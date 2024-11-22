import clsx from "clsx/lite";
import { useState } from "react";
import { PanelCloseIcon } from "../../beta-proto/components/icons/panel-close";
import { PanelOpenIcon } from "../../beta-proto/components/icons/panel-open";
import { useGraphSelection } from "../contexts/graph-selection";
import { ContentTypeIcon } from "./content-type-icon";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "./properties-panel-tabs";

export function PropertiesPanel() {
	const { selectedNode } = useGraphSelection();
	const [show, setShow] = useState(false);
	return (
		<div
			className={clsx(
				"absolute bg-black-100 rounded-[16px] overflow-hidden shadow-[0px_0px_8px_0px_hsla(0,_0%,_100%,_0.2)] top-[0px] right-[20px] mt-[60px]",
				"data-[state=show]:w-[380px] data-[state=show]:bottom-[20px]",
			)}
			data-state={show ? "show" : "hidden"}
		>
			<div className="absolute z-0 rounded-[16px] inset-0 border mask-fill bg-gradient-to-br bg-origin-border bg-clip-boarder border-transparent from-[hsla(233,4%,37%,1)] to-[hsla(233,62%,22%,1)]" />

			{show ? (
				<Tabs>
					<div className="relative z-10 flex justify-between items-center pl-[16px] pr-[24px] py-[10px] h-[56px]">
						<button
							type="button"
							onClick={() => setShow(false)}
							className="p-[8px]"
						>
							<PanelCloseIcon className="w-[18px] h-[18px] fill-black-30" />
						</button>
						<TabsList>
							{selectedNode?.content?.type === "textGeneration" && (
								<>
									<TabsTrigger value="Prompt">Prompt</TabsTrigger>
									<TabsTrigger value="Property">Property</TabsTrigger>
									<TabsTrigger value="Result">Result</TabsTrigger>
								</>
							)}
						</TabsList>
					</div>

					{selectedNode && (
						<div className="bg-black-80 px-[24px] py-[8px] flex items-center justify-between">
							<div className="flex items-center gap-[8px]">
								<div
									data-type={selectedNode.type}
									className={clsx(
										"rounded-[2px] flex items-center justify-center px-[4px] py-[4px]",
										"data-[type=action]:bg-[hsla(187,71%,48%,1)]",
										"data-[type=variable]:bg-white",
									)}
								>
									<ContentTypeIcon
										contentType={selectedNode.content.type}
										className="w-[14px] h-[14px] fill-black-100"
									/>
								</div>
								<div className="font-avenir text-[16px] text-black-30">
									{selectedNode.content.type}
								</div>
							</div>
							<div className="">
								<button
									type="button"
									className="relative z-10 rounded-[8px] shadow-[0px_0px_3px_0px_#FFFFFF40_inset] py-[4px] px-[8px] bg-black-80 text-black-30 font-rosart text-[14px] disabled:bg-black-40"
								>
									Generate
								</button>
							</div>
						</div>
					)}
					<TabsContent value="Result">hello</TabsContent>
				</Tabs>
			) : (
				<div className="relative z-10 flex justify-between items-center">
					<button
						type="button"
						onClick={() => setShow(true)}
						className="p-[16px]"
					>
						<PanelOpenIcon className="w-[18px] h-[18px] fill-black-30" />
					</button>
				</div>
			)}
		</div>
	);
}
