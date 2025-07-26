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
						{ id: 1, name: "apple" },
						{ id: 2, name: "banana" },
						{ id: 3, name: "melon" },
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
								{ id: 1, name: "Apple" },
								{ id: 2, name: "Banana" },
								{ id: 3, name: "Orange" },
							],
						},
						{
							groupId: "vegetables",
							groupLabel: "Vegetables",
							items: [
								{ id: 4, name: "Carrot" },
								{ id: 5, name: "Broccoli" },
								{ id: 6, name: "Spinach" },
							],
						},
						{
							groupId: "grains",
							groupLabel: "Grains",
							items: [
								{ id: 7, name: "Rice" },
								{ id: 8, name: "Wheat" },
								{ id: 9, name: "Oats" },
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
						{ id: 1, name: "Profile", icon: <User /> },
						{ id: 2, name: "Documents", icon: <FileText /> },
						{ id: 3, name: "Settings", icon: <Settings /> },
						{ id: 4, name: "Help", icon: <HelpCircle /> },
						{ id: 5, name: "Sign Out", icon: <LogOut /> },
					]}
					renderItem={(option) => option.name}
					trigger={<Button>Icon Example</Button>}
				/>
			</DemoSection>
		</UiPage>
	);
}
