"use client";

import { Button } from "@giselle-internal/ui/button";
import { DropdownMenu } from "@giselle-internal/ui/dropdown-menu";
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
					onSelect={(event, option) => {
						console.log("Selected:", option);
					}}
				/>
			</DemoSection>
		</UiPage>
	);
}
