"use client";

import { Button } from "@giselle-internal/ui/button";
import { DropdownMenu } from "@giselle-internal/ui/dropdown-menu";
import { FileText, HelpCircle, LogOut, Settings, User } from "lucide-react";
import { DemoSection } from "../components/demo-section";
import { UiPage } from "../components/ui-page";

export default function () {
	return (
		<UiPage title="Dropdown Menu">
			<DemoSection label="Basic Demo">
				<DropdownMenu
					items={[
						{ value: 1, name: "apple" },
						{ value: 2, name: "banana" },
						{ value: 3, name: "melon" },
					]}
					renderItem={(option) => option.name}
					trigger={<Button>Basic Example</Button>}
				/>
			</DemoSection>
			<DemoSection label="Group Demo">
				<DropdownMenu
					items={[
						{
							groupId: "fruits",
							groupLabel: "Fruits",
							items: [
								{ value: 1, name: "Apple" },
								{ value: 2, name: "Banana" },
								{ value: 3, name: "Orange" },
							],
						},
						{
							groupId: "vegetables",
							groupLabel: "Vegetables",
							items: [
								{ value: 4, name: "Carrot" },
								{ value: 5, name: "Broccoli" },
								{ value: 6, name: "Spinach" },
							],
						},
						{
							groupId: "grains",
							groupLabel: "Grains",
							items: [
								{ value: 7, name: "Rice" },
								{ value: 8, name: "Wheat" },
								{ value: 9, name: "Oats" },
							],
						},
					]}
					renderItem={(option) => option.name}
					trigger={<Button>Group Example</Button>}
					onSelect={(_event, option) => {
						console.log("Selected:", option);
					}}
				/>
			</DemoSection>
			<DemoSection label="Icon Demo">
				<DropdownMenu
					items={[
						{ value: 1, name: "Profile", icon: <User /> },
						{ value: 2, name: "Documents", icon: <FileText /> },
						{ value: 3, name: "Settings", icon: <Settings /> },
						{ value: 4, name: "Help", icon: <HelpCircle /> },
						{ value: 5, name: "Sign Out", icon: <LogOut /> },
					]}
					renderItem={(option) => option.name}
					trigger={<Button>Icon Example</Button>}
				/>
			</DemoSection>
		</UiPage>
	);
}
