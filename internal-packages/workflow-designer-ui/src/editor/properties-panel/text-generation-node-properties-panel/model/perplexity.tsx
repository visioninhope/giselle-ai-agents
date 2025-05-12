import { PerplexityLanguageModelData } from "@giselle-sdk/data-type";
import { perplexityLanguageModels } from "@giselle-sdk/language-model";
import { useUsageLimits } from "giselle-sdk/react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../../../../ui/button";
import { Input } from "../../../../ui/input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../../../ui/select";
import { Slider } from "../../../../ui/slider";
import { Switch } from "../../../../ui/switch";
import { languageModelAvailable } from "./utils";

export function PerplexityModelPanel({
	perplexityLanguageModel,
	onModelChange,
}: {
	perplexityLanguageModel: PerplexityLanguageModelData;
	onModelChange: (changedValue: PerplexityLanguageModelData) => void;
}) {
	const limits = useUsageLimits();
	const [domainInput, setDomainInput] = useState("");
	const [listMode, setListMode] = useState(true);
	const domains = getDomains();

	// listMode: if no domains start with '-' then allowlist, if all domains start with '-' then denylist
	useEffect(() => {
		if (domains.length === 0) {
			// Do nothing if domains is empty (allow user to toggle manually)
			return;
		}
		setListMode(domains.every((d) => !d.startsWith("-")));
	}, [domains]);

	function getDomains() {
		// Always return the raw searchDomainFilter array
		return perplexityLanguageModel.configurations.searchDomainFilter || [];
	}

	function addDomain() {
		const value = domainInput.trim();
		if (!value) return;
		if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value.replace(/^\-/, "")))
			return; // simple domain validation
		if (domains.length >= 10) return;
		if (domains.some((d) => d.replace(/^\-/, "") === value.replace(/^\-/, "")))
			return;
		// Add domain with or without '-' based on listMode
		const newDomain = listMode
			? value.replace(/^\-/, "")
			: `-${value.replace(/^\-/, "")}`;
		const newDomains = [...domains, newDomain];
		onModelChange(
			PerplexityLanguageModelData.parse({
				...perplexityLanguageModel,
				configurations: {
					...perplexityLanguageModel.configurations,
					searchDomainFilter: newDomains,
				},
			}),
		);
		setDomainInput("");
	}

	function removeDomain(idx: number) {
		const newDomains = domains.filter((_, i) => i !== idx);
		onModelChange(
			PerplexityLanguageModelData.parse({
				...perplexityLanguageModel,
				configurations: {
					...perplexityLanguageModel.configurations,
					searchDomainFilter: newDomains,
				},
			}),
		);
	}

	// When switching allowlist/denylist mode, convert all domains accordingly
	function handleModeSwitch(checked: boolean) {
		setListMode(checked);
		const convertedDomains = checked
			? domains.map((d) => d.replace(/^\-/, "")) // to allowlist (remove '-')
			: domains.map((d) => (d.startsWith("-") ? d : `-${d}`)); // to denylist (add '-')
		onModelChange(
			PerplexityLanguageModelData.parse({
				...perplexityLanguageModel,
				configurations: {
					...perplexityLanguageModel.configurations,
					searchDomainFilter: convertedDomains,
				},
			}),
		);
	}

	return (
		<div className="flex flex-col gap-[34px]">
			<Select
				value={perplexityLanguageModel.id}
				onValueChange={(value) => {
					onModelChange(
						PerplexityLanguageModelData.parse({
							...perplexityLanguageModel,
							id: value,
						}),
					);
				}}
			>
				<SelectTrigger>
					<SelectValue placeholder="Select a LLM" />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						{perplexityLanguageModels.map((perplexityLanguageModel) => (
							<SelectItem
								key={perplexityLanguageModel.id}
								value={perplexityLanguageModel.id}
								disabled={
									!languageModelAvailable(perplexityLanguageModel, limits)
								}
							>
								{perplexityLanguageModel.id}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
			<div>
				<div className="grid grid-cols-2 gap-[24px]">
					<Slider
						label="Temperature"
						value={perplexityLanguageModel.configurations.temperature}
						max={2.0}
						min={0.0}
						step={0.01}
						onChange={(value) => {
							onModelChange(
								PerplexityLanguageModelData.parse({
									...perplexityLanguageModel,
									configurations: {
										...perplexityLanguageModel.configurations,
										temperature: value,
									},
								}),
							);
						}}
					/>
					<Slider
						label="Top P"
						value={perplexityLanguageModel.configurations.topP}
						max={1.0}
						min={0.0}
						step={0.01}
						onChange={(value) => {
							onModelChange(
								PerplexityLanguageModelData.parse({
									...perplexityLanguageModel,
									configurations: {
										...perplexityLanguageModel.configurations,
										topP: value,
									},
								}),
							);
						}}
					/>
					<Slider
						label="Frequency Panalty"
						value={perplexityLanguageModel.configurations.frequencyPenalty}
						min={0.0}
						step={0.01}
						onChange={(value) => {
							onModelChange(
								PerplexityLanguageModelData.parse({
									...perplexityLanguageModel,
									configurations: {
										...perplexityLanguageModel.configurations,
										frequencyPenalty: value,
									},
								}),
							);
						}}
					/>
					<Slider
						label="Presence Penalty"
						value={perplexityLanguageModel.configurations.presencePenalty}
						max={2.0}
						min={-2.0}
						step={0.01}
						onChange={(value) => {
							onModelChange(
								PerplexityLanguageModelData.parse({
									...perplexityLanguageModel,
									configurations: {
										...perplexityLanguageModel.configurations,
										presencePenalty: value,
									},
								}),
							);
						}}
					/>
				</div>
			</div>
			{/* --- Search Domain Filter Section --- */}
			<div className="flex flex-col gap-2 mt-8">
				<span className="font-bold text-[15px]">Search Domain Filter</span>
				<div className="flex items-center gap-4">
					<span className="text-[13px]">Mode:</span>
					<Switch
						label={listMode ? "Allowlist" : "Denylist"}
						name="search-domain-mode"
						checked={listMode}
						onCheckedChange={handleModeSwitch}
					/>
				</div>
				<div className="flex items-center gap-2 mt-2">
					<Input
						placeholder="Add domain (e.g. wikipedia.org)"
						value={domainInput}
						onChange={(e) => setDomainInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								addDomain();
							}
						}}
						maxLength={100}
						disabled={domains.length >= 10}
					/>
					<Button
						variant="outline"
						size="sm"
						disabled={domains.length >= 10 || !domainInput.trim()}
						onClick={addDomain}
					>
						Add
					</Button>
				</div>
				{domains.length >= 10 && (
					<p className="text-red-700 text-[12px]">
						You can add up to 10 domains only.
					</p>
				)}
				<ul className="flex flex-wrap gap-2 mt-2">
					{domains.map((domain, idx) => (
						<li
							key={domain}
							className="flex items-center bg-white-900/10 rounded px-2 py-1 text-[13px]"
						>
							{/* Display domain without '-' in denylist mode for clarity */}
							{domain.replace(/^\-/, "")}
							<Button
								variant="ghost"
								size="sm"
								className="ml-1 px-1"
								onClick={() => removeDomain(idx)}
							>
								×
							</Button>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
