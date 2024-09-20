"use client";

import { GiselleLogo } from "@/components/giselle-logo";
import {
	Background,
	BackgroundVariant,
	Panel,
	ReactFlow,
	ReactFlowProvider,
	SelectionMode,
} from "@xyflow/react";
import { type FC, type PropsWithChildren, forwardRef, useState } from "react";
import bg from "./bg.png";
import "@xyflow/react/dist/style.css";
import { Toolbar } from "./tool/components";
import { ToolProvider } from "./tool/provider";

const GradientBorder: FC = () => (
	<div className="absolute z-0 rounded-[8px] inset-0 border mask-fill bg-gradient-to-br from-[hsla(232,37%,72%,0.2)] to-[hsla(218,58%,21%,0.9)] bg-origin-border bg-clip-boarder border-transparent" />
);

// const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
// 	({ className, variant, asChild = false, ...props }, ref) => {

const ToolbarButton = forwardRef<HTMLButtonElement, PropsWithChildren>(
	(props, ref) => (
		<button
			type="button"
			className="rounded-[8px] border-[0.5px] border-[hsla(207,19%,77%,0.3)] h-[32px] px-[8px] flex items-center gap-[6px] hover:border-[hsla(207,19%,77%,1)] data-[state=open]:border-[1px] data-[state=open]:border-black-30"
			ref={ref}
			{...props}
		/>
	),
);

function Inner() {
	const [previewMode, setPreviewMode] = useState(false);
	return (
		<div className="w-full h-screen">
			<div className="absolute z-10 left-[20px] right-[20px] top-[20px] h-[36px] flex justify-between">
				<div className="flex gap-[8px] items-center">
					<GiselleLogo className="fill-white w-[70px] h-auto mt-[6px]" />
					<div className="font-rosart text-[18px] text-black--30">
						Playground
					</div>
					<div className="flex items-center gap-[10px] group">
						<label className="w-[30px] h-[18px] border border-black-70 rounded-full relative bg-black-80 cursor-pointer group has-[:checked]:bg-black-70 ">
							<div className="absolute bg-black-100 rounded-full w-[16px] h-[16px] group-has-[:checked]:translate-x-[12px]  transition-all" />
							<input type="checkbox" name="previewMode" className="hidden" />
						</label>
						<div className="relative font-avenir h-[18px] text-[12px]">
							<div className="h-[18px] flex items-center absolute top-0 text-black--30 opacity-100 group-has-[:checked]:opacity-0 transition-opacity duration-400">
								Edit
							</div>
							<div className="h-[18px] flex items-center  absolute text-black--30 opacity-0 group-has-[:checked]:opacity-100 transition-opacity duration-400">
								Preview
							</div>
						</div>
					</div>
				</div>
			</div>
			<ReactFlow
				panOnScroll
				selectionOnDrag
				panOnDrag={[1, 2]}
				selectionMode={SelectionMode.Partial}
				colorMode="dark"
			>
				<Background
					className="!bg-black-100"
					lineWidth={0}
					variant={BackgroundVariant.Lines}
					style={{
						backgroundImage: `url(${bg.src})`,
						backgroundPositionX: "center",
						backgroundPositionY: "center",
						backgroundSize: "cover",
					}}
				/>

				<Panel position={"bottom-center"}>
					<Toolbar />
				</Panel>
			</ReactFlow>
		</div>
	);
}

export default function Page() {
	return (
		<ReactFlowProvider>
			<ToolProvider>
				<Inner />
			</ToolProvider>
		</ReactFlowProvider>
	);
}
