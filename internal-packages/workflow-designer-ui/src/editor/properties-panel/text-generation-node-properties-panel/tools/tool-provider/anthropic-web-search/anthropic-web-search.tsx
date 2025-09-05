import { Button } from "@giselle-internal/ui/button";
import { Input } from "@giselle-internal/ui/input";

import type { TextGenerationNode } from "@giselle-sdk/data-type";
import { useWorkflowDesigner } from "@giselle-sdk/giselle/react";
import { Settings2Icon } from "lucide-react";
import { useCallback, useState } from "react";
import { BasicTagInput } from "../../../../../../ui/basic-tag-input";
import { ToolConfigurationDialog } from "../../ui/tool-configuration-dialog";

// Configuration
const MAX_USES_LIMIT = 10;

// Domain validation function
function isValidDomain(domain: string): { isValid: boolean; message?: string } {
	// Basic domain validation regex
	const domainRegex =
		/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/;

	if (!domainRegex.test(domain)) {
		return {
			isValid: false,
			message: "Please enter a valid domain (e.g., example.com)",
		};
	}

	return { isValid: true };
}

export function AnthropicWebSearchToolConfigurationDialog({
	node,
	open: externalOpen,
	onOpenChange: externalOnOpenChange,
}: {
	node: TextGenerationNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}) {
	const { updateNodeDataContent } = useWorkflowDesigner();
	const [internalOpen, setInternalOpen] = useState(false);

	const open = externalOpen ?? internalOpen;
	const setOpen = externalOnOpenChange ?? setInternalOpen;

	// Get current configuration or set defaults
	const currentConfig = node.content.tools?.anthropicWebSearch;
	const [maxUses, setMaxUses] = useState(currentConfig?.maxUses ?? 3);
	const [filteringMode, setFilteringMode] = useState<
		"none" | "allow" | "block"
	>(
		currentConfig?.allowedDomains && currentConfig.allowedDomains.length > 0
			? "allow"
			: currentConfig?.blockedDomains && currentConfig.blockedDomains.length > 0
				? "block"
				: "none",
	);
	const [allowedDomains, setAllowedDomains] = useState<string[]>(
		currentConfig?.allowedDomains ?? [],
	);
	const [blockedDomains, setBlockedDomains] = useState<string[]>(
		currentConfig?.blockedDomains ?? [],
	);
	const [maxUsesError, setMaxUsesError] = useState<string | null>(null);
	const [domainListError, setDomainListError] = useState<string | null>(null);

	const handleMaxUsesChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = parseInt(e.target.value, 10);
			if (Number.isNaN(value) || value < 1 || value > MAX_USES_LIMIT) {
				setMaxUsesError(`Maximum uses must be between 1 and ${MAX_USES_LIMIT}`);
			} else {
				setMaxUsesError(null);
				setMaxUses(value);
			}
		},
		[],
	);

	const updateAnthropicWebSearchToolConfiguration = useCallback<
		React.FormEventHandler<HTMLFormElement>
	>(
		(e) => {
			e.preventDefault();

			// Clear unused domain list based on filtering mode
			const finalAllowedDomains =
				filteringMode === "allow" ? allowedDomains : undefined;
			const finalBlockedDomains =
				filteringMode === "block" ? blockedDomains : undefined;

			// Validate max uses
			if (maxUses < 1 || maxUses > MAX_USES_LIMIT) {
				setMaxUsesError(`Maximum uses must be between 1 and ${MAX_USES_LIMIT}`);
				return;
			}

			// Update node configuration
			updateNodeDataContent(node, {
				...node.content,
				tools: {
					...node.content.tools,
					anthropicWebSearch: {
						maxUses,
						allowedDomains: finalAllowedDomains,
						blockedDomains: finalBlockedDomains,
					},
				},
			});

			// Clear errors and close
			setDomainListError(null);
			setOpen(false);
		},
		[
			node,
			updateNodeDataContent,
			maxUses,
			filteringMode,
			allowedDomains,
			blockedDomains,
			setOpen,
		],
	);

	return (
		<ToolConfigurationDialog
			title="Web Search Configuration"
			description=""
			onSubmit={updateAnthropicWebSearchToolConfiguration}
			submitting={false}
			trigger={
				<Button
					type="button"
					leftIcon={<Settings2Icon data-dialog-trigger-icon />}
				>
					Configure
				</Button>
			}
			open={open}
			onOpenChange={setOpen}
		>
			<div className="flex flex-col gap-6">
				{/* Maximum Uses Input */}
				<div className="flex flex-col gap-2">
					<label htmlFor="max-uses" className="text-sm font-medium text-text">
						Maximum Uses (1-{MAX_USES_LIMIT})
					</label>
					<Input
						type="number"
						id="max-uses"
						min="1"
						max={MAX_USES_LIMIT}
						value={maxUses}
						onChange={handleMaxUsesChange}
						className="w-full"
					/>
					{maxUsesError && (
						<p className="text-sm text-red-600" role="alert">
							{maxUsesError}
						</p>
					)}
				</div>

				{/* Domain Filtering Section */}
				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-2">
						<h3 className="text-sm font-medium text-text">Domain Filtering</h3>
						<p className="text-xs text-text-muted">
							Choose how to filter search domains:
						</p>
					</div>

					<div className="flex flex-col gap-3">
						{/* No Filtering */}
						<label className="flex items-start gap-3 cursor-pointer">
							<input
								type="radio"
								name="filtering-mode"
								value="none"
								checked={filteringMode === "none"}
								onChange={(e) => {
									if (e.target.checked) {
										setFilteringMode("none");
										setAllowedDomains([]);
										setBlockedDomains([]);
										if (domainListError) setDomainListError(null);
									}
								}}
								className="mt-1 w-4 h-4"
							/>
							<div className="flex flex-col gap-1">
								<span className="text-base font-medium text-text">
									No Filtering
								</span>
								<span className="text-sm text-text-muted">
									Search all domains
								</span>
							</div>
						</label>

						{/* Allow Specific Domains */}
						<label className="flex items-start gap-3 cursor-pointer">
							<input
								type="radio"
								name="filtering-mode"
								value="allow"
								checked={filteringMode === "allow"}
								onChange={(e) => {
									if (e.target.checked) {
										setFilteringMode("allow");
										setBlockedDomains([]);
										if (domainListError) setDomainListError(null);
									}
								}}
								className="mt-1 w-4 h-4"
							/>
							<div className="flex flex-col gap-1">
								<span className="text-base font-medium text-text">
									Allow Specific Domains
								</span>
								<span className="text-sm text-text-muted">
									Only search within listed domains
								</span>
							</div>
						</label>

						{/* Block Specific Domains */}
						<label className="flex items-start gap-3 cursor-pointer">
							<input
								type="radio"
								name="filtering-mode"
								value="block"
								checked={filteringMode === "block"}
								onChange={(e) => {
									if (e.target.checked) {
										setFilteringMode("block");
										setAllowedDomains([]);
										if (domainListError) setDomainListError(null);
									}
								}}
								className="mt-1 w-4 h-4"
							/>
							<div className="flex flex-col gap-1">
								<span className="text-base font-medium text-text">
									Block Specific Domains
								</span>
								<span className="text-sm text-text-muted">
									Exclude blocked domains
								</span>
							</div>
						</label>
					</div>

					{/* Domain Input Section */}
					{filteringMode !== "none" && (
						<div className="flex flex-col gap-4 mt-4">
							{/* Header with status text on same line */}
							<div className="flex items-center gap-4">
								<h4 className="text-sm font-medium text-text">
									{filteringMode === "allow"
										? "Allowed Domains"
										: "Blocked Domains"}
								</h4>
								<span className="text-xs text-text-muted italic">
									{filteringMode === "allow"
										? "No domains specified - all domains will be blocked"
										: "No domains specified"}
								</span>
							</div>

							{/* Input field */}
							<div>
								<BasicTagInput
									placeholder="Enter domain (e.g., example.com)"
									initialTags={
										filteringMode === "allow" ? allowedDomains : blockedDomains
									}
									onTagsChange={(tags) => {
										if (filteringMode === "allow") {
											setAllowedDomains(tags);
										} else {
											setBlockedDomains(tags);
										}
										if (domainListError) setDomainListError(null);
									}}
									validateInput={isValidDomain}
								/>
							</div>

							{domainListError && (
								<p className="text-sm text-red-600" role="alert">
									{domainListError}
								</p>
							)}
						</div>
					)}
				</div>
			</div>
		</ToolConfigurationDialog>
	);
}
