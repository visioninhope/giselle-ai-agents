import { Select } from "@giselle-internal/ui/select";
import { FileText, HelpCircle, LogOut, Settings, User } from "lucide-react";
import { DemoSection } from "../components/demo-section";
import { UiPage } from "../components/ui-page";

export default function () {
	return (
		<UiPage title="Select">
			<DemoSection label="Demo">
				<Select
					name="repositoryNodeId"
					options={[
						{ value: 1, name: "apple" },
						{ value: 2, name: "banana" },
						{ value: 3, name: "melon" },
						{ value: 4, name: "long long long option" },
					]}
					renderOption={(option) => option.name}
					placeholder="Select apple..."
				/>
			</DemoSection>
			<DemoSection label="Icon Demo">
				<Select
					name="iconSelect"
					options={[
						{ value: 1, icon: <FileText />, name: "Documents" },
						{ value: 2, icon: <Settings />, name: "Settings" },
						{ value: 3, icon: <User />, name: "Profile" },
						{ value: 4, icon: <HelpCircle />, name: "Help" },
						{ value: 5, icon: <LogOut />, name: "Sign out" },
					]}
					renderOption={(option) => option.name}
					placeholder="Select an option..."
				/>
			</DemoSection>
		</UiPage>
	);
}
