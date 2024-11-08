import { GithubIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { LayersIcon } from "../components/icons/layers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/tabs";

export function LeftMenu() {
	return (
		<Tabs orientation="vertical">
			<TabsList>
				<TabsTrigger value="overview">
					<LayersIcon className="w-[18px] h-[18px] fill-black-30" />
				</TabsTrigger>
				<TabsTrigger value="github">
					<GithubIcon className="w-[18px] h-[18px] stroke-black-30" />
				</TabsTrigger>
			</TabsList>
			<TabsContent value="overview">
				<div className="grid gap-[24px] px-[24px] py-[24px]">
					<header className="flex justify-between">
						<p
							className="text-[22px] font-rosart text-black--30"
							style={{ textShadow: "0px 0px 20px hsla(207, 100%, 48%, 1)" }}
						>
							Overview
						</p>
						<button type="button">
							<XIcon className="w-[16px] h-[16px]" />
						</button>
					</header>
					{/* <div>
						<div className="flex items-center">
							<span className="flex-shrink text-black-30 text-[16px] font-rosart font-[500]">
								Overview
							</span>
							<div className="ml-[16px] flex-grow border-t border-black-80" />
						</div>
					</div> */}
					<div className="text-[16px] text-black-30 p-[4px]">Unnamed Agent</div>
				</div>
			</TabsContent>
			<TabsContent value="github">
				<div className="grid gap-[24px] px-[24px] py-[24px]">
					<header className="flex justify-between">
						<p
							className="text-[22px] font-rosart text-black--30"
							style={{ textShadow: "0px 0px 20px hsla(207, 100%, 48%, 1)" }}
						>
							GitHub Integration
						</p>
						<button type="button">
							<XIcon className="w-[16px] h-[16px]" />
						</button>
					</header>
				</div>
			</TabsContent>
		</Tabs>
	);
}
