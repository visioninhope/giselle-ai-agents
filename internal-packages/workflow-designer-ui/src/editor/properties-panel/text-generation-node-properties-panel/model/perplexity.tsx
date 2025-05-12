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
	const [allowlistInput, setAllowlistInput] = useState("");
	const [denylistInput, setDenylistInput] = useState("");

	const allowlist = useMemo(
		() =>
			(perplexityLanguageModel.configurations.searchDomainFilter || []).filter(
				(d) => !d.startsWith("-"),
			),
		[perplexityLanguageModel.configurations.searchDomainFilter],
	);
	const denylist = useMemo(
		() =>
			(perplexityLanguageModel.configurations.searchDomainFilter || []).filter(
				(d) => d.startsWith("-"),
			),
		[perplexityLanguageModel.configurations.searchDomainFilter],
	);

	function updateDomainFilter(newAllow: string[], newDeny: string[]) {
		const merged = [...newAllow, ...newDeny];
		onModelChange(
			PerplexityLanguageModelData.parse({
				...perplexityLanguageModel,
				configurations: {
					...perplexityLanguageModel.configurations,
					searchDomainFilter: merged,
				},
			}),
		);
	}

	function addAllowDomain() {
		const value = allowlistInput.trim();
		if (!value) return;
		if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) return;
		if (allowlist.length + denylist.length >= 10) return;
		if (allowlist.includes(value) || denylist.some((d) => d.slice(1) === value))
			return;
		updateDomainFilter([...allowlist, value], denylist);
		setAllowlistInput("");
	}

	function addDenyDomain() {
		const value = denylistInput.trim();
		if (!value) return;
		if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) return;
		if (allowlist.length + denylist.length >= 10) return;
		if (denylist.includes(`-${value}`) || allowlist.includes(value)) return;
		updateDomainFilter(allowlist, [...denylist, `-${value}`]);
		setDenylistInput("");
	}

	function removeAllowDomain(idx: number) {
		const newAllow = allowlist.filter((_, i) => i !== idx);
		updateDomainFilter(newAllow, denylist);
	}
	function removeDenyDomain(idx: number) {
		const newDeny = denylist.filter((_, i) => i !== idx);
		updateDomainFilter(allowlist, newDeny);
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
				{/* Allowlist Section */}
				<span className="text-green-600 text-[14px] font-semibold mt-2">
					✔ Allowlist ({allowlist.length})
				</span>
				<div className="flex items-center gap-2 mt-1">
					<Input
						placeholder="Enter domain to include (e.g., example.com)"
						value={allowlistInput}
						onChange={(e) => setAllowlistInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") addAllowDomain();
						}}
						maxLength={100}
						disabled={allowlist.length + denylist.length >= 10}
					/>
					<Button
						variant="outline"
						size="sm"
						disabled={
							allowlist.length + denylist.length >= 10 || !allowlistInput.trim()
						}
						onClick={addAllowDomain}
					>
						Add
					</Button>
				</div>
				<ul className="flex flex-wrap gap-2 mt-2">
					{allowlist.map((domain, idx) => (
						<li
							key={domain}
							className="flex items-center bg-white-900/10 rounded px-2 py-1 text-[13px]"
						>
							{domain}
							<Button
								variant="ghost"
								size="sm"
								className="ml-1 px-1"
								onClick={() => removeAllowDomain(idx)}
							>
								×
							</Button>
						</li>
					))}
				</ul>
				{/* Denylist Section */}
				<span className="text-red-600 text-[14px] font-semibold mt-4">
					⛔ Denylist ({denylist.length})
				</span>
				<div className="flex items-center gap-2 mt-1">
					<Input
						placeholder="Enter domain to exclude (e.g., example.com)"
						value={denylistInput}
						onChange={(e) => setDenylistInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") addDenyDomain();
						}}
						maxLength={100}
						disabled={allowlist.length + denylist.length >= 10}
					/>
					<Button
						variant="outline"
						size="sm"
						disabled={
							allowlist.length + denylist.length >= 10 || !denylistInput.trim()
						}
						onClick={addDenyDomain}
					>
						Add
					</Button>
				</div>
				<ul className="flex flex-wrap gap-2 mt-2">
					{denylist.map((domain, idx) => (
						<li
							key={domain}
							className="flex items-center bg-white-900/10 rounded px-2 py-1 text-[13px]"
						>
							{domain.replace(/^\-/, "")}
							<Button
								variant="ghost"
								size="sm"
								className="ml-1 px-1"
								onClick={() => removeDenyDomain(idx)}
							>
								×
							</Button>
						</li>
					))}
				</ul>
				{allowlist.length + denylist.length >= 10 && (
					<p className="text-red-700 text-[12px]">
						You can add up to 10 domains only.
					</p>
				)}
			</div>
		</div>
	);
}
