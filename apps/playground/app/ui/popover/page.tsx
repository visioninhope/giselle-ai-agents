"use client";

import { Button } from "@giselle-internal/ui/button";
import { Popover } from "@giselle-internal/ui/popover";
import { DemoSection } from "../demo-section";
import { UiPage } from "../ui-page";

export default function () {
	return (
		<UiPage title="Dropdown Menu">
			<DemoSection label="Demo">
				<Popover trigger={<Button>Hello</Button>}>
					<p>content</p>
				</Popover>
			</DemoSection>
		</UiPage>
	);
}
