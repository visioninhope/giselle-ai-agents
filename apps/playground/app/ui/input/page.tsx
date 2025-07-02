import { Input } from "@giselle-internal/ui/input";
import { DemoSection } from "../demo-section";
import { UiPage } from "../ui-page";

export default function () {
	return (
		<UiPage title="Input">
			<DemoSection label="Demo">
				<Input placeholder="Type here..." />
			</DemoSection>
		</UiPage>
	);
}
