import * as Tabs from "@radix-ui/react-tabs";
import { GithubIcon } from "lucide-react";
import { type ComponentProps, useState } from "react";
import { LayersIcon } from "../../beta-proto/components/icons/layers";

function TabsTrigger(
	props: Omit<ComponentProps<typeof Tabs.Trigger>, "className">,
) {
	return (
		<Tabs.Trigger
			className="w-[40px] h-[40px] flex items-center justify-center rounded-full hover:bg-[hsla(30,100%,98%,0.2)] data-[state=active]:bg-black-80"
			{...props}
		/>
	);
}

function TabsContent(
	props: Omit<ComponentProps<typeof Tabs.Content>, "className">,
) {
	return (
		<Tabs.Content
			className="absolute w-[400px] rounded-[24px] bg-[hsla(234,91%,5%,0.8)] overflow-hidden shadow-[0px_0px_3px_0px_hsla(0,_0%,_100%,_0.25)_inset] top-[0px] bottom-[20px] left-[84px] mt-[60px] backdrop-blur-[16px]"
			{...props}
		/>
	);
}

export function NavigationPanel() {
	const [tabValue, setTabValue] = useState("");
	return (
		<Tabs.Root
			orientation="vertical"
			value={tabValue}
			onValueChange={(value) => setTabValue(value)}
		>
			<Tabs.List className="absolute w-[54px] rounded-full bg-[hsla(233,93%,5%,0.8)] px-[4px] py-[8px] overflow-hidden shadow-[0px_0px_3px_0px_hsla(0,_0%,_100%,_0.25)_inset] top-[0px] left-[20px] mt-[60px] grid justify-center gap-[4px]">
				<TabsTrigger value="overview">
					<LayersIcon className="w-[18px] h-[18px] fill-black-30" />
				</TabsTrigger>
				<TabsTrigger value="github">
					<GithubIcon className="w-[18px] h-[18px] stroke-black-30" />
				</TabsTrigger>
			</Tabs.List>
			<TabsContent value="overview">
				<Overview />
			</TabsContent>
			<TabsContent value="github">
				<GitHubIntegration />
			</TabsContent>
		</Tabs.Root>
	);
}

function Overview() {
	return <div>Overview</div>;
}

function GitHubIntegration() {
	return <div>GitHub Integration</div>;
}
