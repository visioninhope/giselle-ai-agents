import { Select } from "@giselle-internal/ui/select";
import { DemoSection } from "../components/demo-section";
import { UiPage } from "../components/ui-page";

export default function () {
	return (
		<UiPage title="Select">
			<DemoSection label="Demo">
				<Select
					name="repositoryNodeId"
					options={[
						{ id: 1, name: "apple" },
						{ id: 2, name: "banana" },
						{ id: 3, name: "melon" },
					]}
					renderOption={(option) => option.name}
					placeholder="Select apple..."
				/>
			</DemoSection>
		</UiPage>
	);
}
