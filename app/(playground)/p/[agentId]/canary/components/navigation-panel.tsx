import * as Tabs from "@radix-ui/react-tabs";
import { GithubIcon, XIcon } from "lucide-react";
import { type ComponentProps, useState } from "react";
import { LayersIcon } from "../../beta-proto/components/icons/layers";
import { useAgentName } from "../contexts/agent-name";

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
				{/* <TabsTrigger value="github">
					<GithubIcon className="w-[18px] h-[18px] stroke-black-30" />
				</TabsTrigger> */}
			</Tabs.List>
			<TabsContent value="overview">
				<Overview setTabValue={setTabValue} />
			</TabsContent>
			{/* <TabsContent value="github">
				<GitHubIntegration />
			</TabsContent> */}
		</Tabs.Root>
	);
}

export function Overview({
	setTabValue,
}: {
	setTabValue: (value: string) => void;
}) {
	const [editTitle, setEditTitle] = useState(false);
	const { agentName, updateAgentName } = useAgentName();
	return (
		<div className="grid gap-[24px] px-[24px] py-[24px]">
			<header className="flex justify-between">
				<p
					className="text-[22px] font-rosart text-black--30"
					style={{ textShadow: "0px 0px 20px hsla(207, 100%, 48%, 1)" }}
				>
					Overview
				</p>
				<button type="button" onClick={() => setTabValue("")}>
					<XIcon className="w-[16px] h-[16px] text-black-30" />
				</button>
			</header>
			{editTitle ? (
				<input
					type="text"
					className="text-[16px] text-black-30 p-[4px] text-left outline-black-70 rounded-[8px]"
					defaultValue={agentName ?? "Untitled Agent"}
					ref={(ref) => {
						if (ref === null) {
							return;
						}
						async function update() {
							if (ref === null) {
								return;
							}
							setEditTitle(false);
							await updateAgentName(ref.value);
						}
						ref.focus();
						ref.select();
						ref.addEventListener("blur", update);
						ref.addEventListener("keydown", (e) => {
							if (e.key === "Enter") {
								update();
							}
						});
						return () => {
							ref.removeEventListener("blur", update);
							ref.removeEventListener("keydown", update);
						};
					}}
				/>
			) : (
				<button
					type="button"
					onClick={() => setEditTitle(true)}
					className="text-[16px] text-black-30 p-[4px] text-left"
				>
					{agentName}
				</button>
			)}
		</div>
	);
}

function GitHubIntegration() {
	return <div>GitHub Integration</div>;
}
