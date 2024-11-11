import { GithubIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { LayersIcon } from "../components/icons/layers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/tabs";
import { Overview } from "./overview/overview";

export function LeftMenu() {
	const [tabValue, setTabValue] = useState("");
	return (
		<Tabs
			orientation="vertical"
			value={tabValue}
			onValueChange={(value) => setTabValue(value)}
		>
			<TabsList>
				<TabsTrigger value="overview">
					<LayersIcon className="w-[18px] h-[18px] fill-black-30" />
				</TabsTrigger>
				{/* <TabsTrigger value="github">
					<GithubIcon className="w-[18px] h-[18px] stroke-black-30" />
				</TabsTrigger> */}
			</TabsList>
			<TabsContent value="overview">
				<Overview setTabValue={setTabValue} />
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
							<XIcon
								className="w-[16px] h-[16px]"
								onClick={() => setTabValue("")}
							/>
						</button>
					</header>
				</div>
			</TabsContent>
		</Tabs>
	);
}
