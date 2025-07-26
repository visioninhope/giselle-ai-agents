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
						{ id: 1, name: "apple" },
						{ id: 2, name: "banana" },
						{ id: 3, name: "melon" },
						{ id: 4, name: "long long long option" },
					]}
					renderOption={(option) => option.name}
					placeholder="Select apple..."
				/>
			</DemoSection>
			<DemoSection label="Icon Demo">
				<Select
					name="iconSelect"
					options={[
						{ id: 1, icon: FileText, name: "Documents" },
						{ id: 2, icon: Settings, name: "Settings" },
						{ id: 3, icon: User, name: "Profile" },
						{ id: 4, icon: HelpCircle, name: "Help" },
						{ id: 5, icon: LogOut, name: "Sign out" },
					]}
					renderOption={(option) => (
						<div className="flex items-center gap-2">
							<option.icon className="h-4 w-4" />
							<span>{option.name}</span>
						</div>
					)}
					placeholder="Select an option..."
				/>
			</DemoSection>
		</UiPage>
	);
}
