import { Note } from "@giselle-internal/ui/note";
import { Select } from "@giselle-internal/ui/select";
import { useIntegration } from "@giselle-sdk/integration/react";
import { InstallGitHubApplication } from "./install-application";
import { Unauthorized } from "./unauthorized";

export function GitHubConnectFieldsets() {
	const { value } = useIntegration();
	if (!value.github) {
		return (
			<Note type="error">Error: GitHub integration is not set up yet.</Note>
		);
	}
	switch (value.github.status) {
		case "unset":
			return (
				<Note type="error">Error: GitHub integration is not set up yet.</Note>
			);
		case "unauthorized":
			return <Unauthorized authUrl={value.github.authUrl} />;
		case "error":
			return <Note type="error">{value.github.errorMessage}</Note>;
		case "invalid-credential":
			return <Note type="error">Invalid GitHub token.</Note>;
		case "not-installed":
			return (
				<InstallGitHubApplication
					installationUrl={value.github.installationUrl}
				/>
			);
		case "installed":
			return (
				<>
					<fieldset className="flex flex-col">
						<label
							htmlFor="Repository"
							className="text-text text-[13px] mb-[2px]"
						>
							Repository
						</label>

						<Select
							name="repository"
							options={value.github.repositories}
							renderOption={(option) => option.full_name}
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
		default: {
			const _exhaustiveCheck: never = value.github;
			throw new Error(`Unhandled provider: ${_exhaustiveCheck}`);
		}
	}
}
