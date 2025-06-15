import { Select } from "@giselle-internal/ui/select";
import { useIntegration } from "@giselle-sdk/integration/react";

export function GitHubConnectFieldsets() {
	const { value } = useIntegration();
	if (!value.github) {
		return null;
	}
	switch (value.github.status) {
		case "unset":
			return null;
	}
	return (
		<>
			<fieldset className="flex flex-col">
				<label htmlFor="Repository" className="text-text text-[13px] mb-[2px]">
					Repository
				</label>

				<Select
					name="repository"
					options={[{ id: "rp-123", label: "giselles-ai/giselle" }]}
					renderOption={(option) => option.label}
					placeholder="Select provider..."
				/>
			</fieldset>
			<fieldset className="flex flex-col">
				<div className="flex justify-between mb-[2px]">
					<label htmlFor="type" className="text-text text-[13px]">
						Type
					</label>
				</div>
				<Select
					name="provider"
					options={[
						{ id: "code", label: "Code" },
						{
							id: "pull-request",
							label: "Pull Request",
						},
					]}
					renderOption={(option) => option.label}
					placeholder="Select provider..."
				/>
			</fieldset>
		</>
	);
}
