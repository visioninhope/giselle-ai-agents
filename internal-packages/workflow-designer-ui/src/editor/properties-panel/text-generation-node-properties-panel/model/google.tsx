import { GoogleLanguageModelData, type ToolSet } from "@giselle-sdk/data-type";
import { useUsageLimits } from "@giselle-sdk/giselle/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { validateUrl } from "../../../lib/validate-url";
import { TemperatureSlider, TopPSlider } from "./shared-model-controls";

const URL_ENTRY_LIMIT = 20;

function normalizeUrlEntries(value: string) {
	const entries = value
		.split(/\r?\n/)
		.map((entry) => entry.trim())
		.filter((entry) => entry.length > 0);
	return entries;
}

function parseUrlInput(value: string) {
	const entries = normalizeUrlEntries(value);
	if (entries.length === 0) {
		return {
			success: false as const,
			error: "Enter at least one URL.",
		};
	}
	const urls: string[] = [];
	for (const entry of entries) {
		const parsed = validateUrl(entry);
		if (parsed === null) {
			return {
				success: false as const,
				error: "One or more URLs are invalid.",
			};
		}
		urls.push(parsed.href);
	}
	if (urls.length > URL_ENTRY_LIMIT) {
		return {
			success: false as const,
			error: "You can provide up to 20 URLs.",
		};
	}
	return { success: true as const, urls };
}

export function GoogleModelPanel({
	googleLanguageModel,
	onModelChange,
	onSearchGroundingConfigurationChange,
	tools,
	onToolChange,
}: {
	googleLanguageModel: GoogleLanguageModelData;
	onModelChange: (changedValue: GoogleLanguageModelData) => void;
	onSearchGroundingConfigurationChange: (enabled: boolean) => void;
	tools?: ToolSet;
	onToolChange: (changedValue: ToolSet) => void;
}) {
	useUsageLimits();
	const googleUrlContextUrls = useMemo(
		() => tools?.googleUrlContext?.urls ?? [],
		[tools?.googleUrlContext?.urls],
	);
	const initialUrlValue = googleUrlContextUrls.join("\n");
	const [urlInput, setUrlInput] = useState<string>(initialUrlValue);
	const [urlError, setUrlError] = useState<string | null>(null);
	const [urlNeedsInput, setUrlNeedsInput] = useState(false);
	const [isUrlDraftDirty, setIsUrlDraftDirty] = useState(false);
	const lastSyncedUrlsRef = useRef<string>(initialUrlValue);
	const latestUrlDraftRef = useRef<string>(initialUrlValue);

	const isUrlContextEnabled = tools?.googleUrlContext !== undefined;
	const isSearchGroundingEnabled =
		googleLanguageModel.configurations.searchGrounding === true;
	const actualIntegrationMode: "none" | "search" | "url" = isUrlContextEnabled
		? "url"
		: isSearchGroundingEnabled
			? "search"
			: "none";
	const [pendingIntegrationMode, setPendingIntegrationMode] = useState<
		"none" | "search" | "url" | null
	>(null);
	const visibleIntegrationMode =
		pendingIntegrationMode ?? actualIntegrationMode;

	const cloneToolSetWithoutUrlContext = useCallback(
		(currentTools?: ToolSet): ToolSet => {
			const nextTools: ToolSet = {};
			if (currentTools?.github !== undefined) {
				nextTools.github = currentTools.github;
			}
			if (currentTools?.postgres !== undefined) {
				nextTools.postgres = currentTools.postgres;
			}
			if (currentTools?.openaiWebSearch !== undefined) {
				nextTools.openaiWebSearch = currentTools.openaiWebSearch;
			}
			if (currentTools?.anthropicWebSearch !== undefined) {
				nextTools.anthropicWebSearch = currentTools.anthropicWebSearch;
			}
			return nextTools;
		},
		[],
	);

	const commitUrlDraft = useCallback(
		(value: string) => {
			const trimmed = value.trim();
			const nextTools = cloneToolSetWithoutUrlContext(tools);
			if (trimmed.length === 0) {
				if (tools?.googleUrlContext !== undefined) {
					onToolChange(nextTools);
					lastSyncedUrlsRef.current = "";
				}
				setUrlNeedsInput(true);
				setUrlError(null);
				setIsUrlDraftDirty(false);
				latestUrlDraftRef.current = "";
				return;
			}
			const result = parseUrlInput(value);
			if (!result.success) {
				setUrlError(result.error);
				setUrlNeedsInput(false);
				setIsUrlDraftDirty(true);
				latestUrlDraftRef.current = value;
				return;
			}
			const normalized = result.urls.join("\n");
			if (normalized === lastSyncedUrlsRef.current) {
				setUrlError(null);
				setUrlNeedsInput(false);
				setIsUrlDraftDirty(false);
				latestUrlDraftRef.current = normalized;
				return;
			}
			onToolChange({
				...nextTools,
				googleUrlContext: { urls: result.urls },
			});
			lastSyncedUrlsRef.current = normalized;
			setUrlError(null);
			setUrlNeedsInput(false);
			setIsUrlDraftDirty(false);
			latestUrlDraftRef.current = normalized;
		},
		[cloneToolSetWithoutUrlContext, onToolChange, tools],
	);

	useEffect(() => {
		return () => {
			if (visibleIntegrationMode === "url") {
				commitUrlDraft(latestUrlDraftRef.current);
			}
		};
	}, [commitUrlDraft, visibleIntegrationMode]);

	useEffect(() => {
		const normalized = googleUrlContextUrls.join("\n");
		lastSyncedUrlsRef.current = normalized;
		setUrlInput((current) => {
			const shouldSync = visibleIntegrationMode !== "url" || !isUrlDraftDirty;
			if (shouldSync) {
				latestUrlDraftRef.current = normalized;
				return normalized;
			}
			return current;
		});
		if (normalized.length > 0) {
			setUrlNeedsInput(false);
			setUrlError(null);
		} else if (visibleIntegrationMode === "url") {
			setUrlNeedsInput(true);
		}
		if (visibleIntegrationMode !== "url") {
			setUrlNeedsInput(false);
			setIsUrlDraftDirty(false);
			latestUrlDraftRef.current = normalized;
		}
	}, [googleUrlContextUrls, visibleIntegrationMode, isUrlDraftDirty]);

	useEffect(() => {
		if (
			pendingIntegrationMode !== null &&
			pendingIntegrationMode === actualIntegrationMode
		) {
			setPendingIntegrationMode(null);
			if (actualIntegrationMode === "url" && googleUrlContextUrls.length > 0) {
				setUrlNeedsInput(false);
			}
		}
	}, [
		pendingIntegrationMode,
		actualIntegrationMode,
		googleUrlContextUrls.length,
	]);

	const applyIntegrationMode = (mode: "none" | "search" | "url") => {
		switch (mode) {
			case "none": {
				if (isSearchGroundingEnabled) {
					onSearchGroundingConfigurationChange(false);
				}
				if (isUrlContextEnabled) {
					const nextTools = cloneToolSetWithoutUrlContext(tools);
					onToolChange(nextTools);
				}
				setUrlError(null);
				setUrlNeedsInput(false);
				setIsUrlDraftDirty(false);
				break;
			}
			case "search": {
				const nextTools = cloneToolSetWithoutUrlContext(tools);
				if (isUrlContextEnabled) {
					onToolChange(nextTools);
				}
				onSearchGroundingConfigurationChange(true);
				setUrlError(null);
				setUrlNeedsInput(false);
				setIsUrlDraftDirty(false);
				break;
			}
			case "url": {
				onSearchGroundingConfigurationChange(false);
				commitUrlDraft(urlInput);
				if (urlInput.trim().length === 0) {
					setUrlNeedsInput(true);
				}
				break;
			}
			default: {
				const _never: never = mode;
				return _never;
			}
		}
	};

	const handleIntegrationModeChange = (mode: "none" | "search" | "url") => {
		setPendingIntegrationMode(mode);
		applyIntegrationMode(mode);
	};

	return (
		<div className="flex flex-col gap-[34px]">
			<div>
				<div className="grid grid-cols-2 gap-[24px]">
					<TemperatureSlider
						onModelChange={onModelChange}
						modelData={googleLanguageModel}
						parseModelData={GoogleLanguageModelData.parse}
					/>
					<TopPSlider
						onModelChange={onModelChange}
						modelData={googleLanguageModel}
						parseModelData={GoogleLanguageModelData.parse}
					/>
					<div className="flex flex-col gap-[8px]">
						<p className="text-[12px] text-white-700">Context Source</p>
						<div className="flex flex-col gap-[12px]">
							{[
								{
									value: "none" as const,
									title: "None",
									description: "Do not add extra context.",
								},
								{
									value: "search" as const,
									title: "Search Grounding",
									description: "Use Google Search to gather context.",
								},
								{
									value: "url" as const,
									title: "URL Context",
									description: "Use the specified URLs as context.",
								},
							].map((option) => (
								<label
									key={option.value}
									className="flex items-start gap-[12px] cursor-pointer"
								>
									<input
										type="radio"
										name="context-source"
										value={option.value}
										checked={visibleIntegrationMode === option.value}
										onChange={(event) => {
											if (!event.target.checked) {
												return;
											}
											handleIntegrationModeChange(option.value);
										}}
										className="mt-[4px] h-[16px] w-[16px] accent-primary-900"
									/>
									<span className="flex flex-col gap-[4px]">
										<span className="text-[12px] text-white-900 font-medium">
											{option.title}
										</span>
										<span className="text-[12px] text-white-700">
											{option.description}
										</span>
									</span>
								</label>
							))}
						</div>
					</div>
				</div>
			</div>
			{visibleIntegrationMode === "url" ? (
				<div className="flex flex-col gap-[12px]">
					<div className="flex flex-col gap-[4px]">
						<p className="text-[12px] text-white-900 font-medium">URL List</p>
						<p className="text-[12px] text-white-700">
							Provide up to 20 HTTPS URLs. Enter one per line.
						</p>
					</div>
					<textarea
						className="w-full min-h-[96px] rounded-[8px] border border-white-900 bg-black-100 p-[12px] text-white-800 outline-none"
						placeholder={"https://example.com\nhttps://docs.example.com"}
						value={urlInput}
						onChange={(event) => {
							const value = event.target.value;
							setUrlInput(value);
							setIsUrlDraftDirty(true);
							latestUrlDraftRef.current = value;
							if (value.trim().length === 0) {
								setUrlNeedsInput(true);
								setUrlError(null);
								return;
							}
							const result = parseUrlInput(value);
							if (!result.success) {
								setUrlNeedsInput(false);
								setUrlError(result.error);
								return;
							}
							setUrlError(null);
							setUrlNeedsInput(false);
						}}
						onBlur={() => {
							commitUrlDraft(urlInput);
						}}
						spellCheck={false}
					/>
					{urlError !== null ? (
						<p className="text-[12px] text-red-900">{urlError}</p>
					) : urlNeedsInput ? (
						<p className="text-[12px] text-white-700">
							Add at least one URL to activate URL Context.
						</p>
					) : null}
				</div>
			) : urlError !== null ? (
				<p className="text-[12px] text-red-900">{urlError}</p>
			) : null}
		</div>
	);
}
