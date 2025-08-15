"use client";

import { Button } from "@giselle-internal/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogTitle,
} from "@giselle-internal/ui/dialog";
import { Select } from "@giselle-internal/ui/select";
import type { FlowTrigger, FlowTriggerId } from "@giselle-sdk/data-type";
import type { ParameterItem } from "@giselle-sdk/giselle";
import { SpinnerIcon } from "@giselles-ai/icons/spinner";
import { cva } from "class-variance-authority";
import clsx from "clsx/lite";
import type { InferSelectModel } from "drizzle-orm";
import { Settings, X } from "lucide-react";
import { useActionState, useCallback, useMemo, useState } from "react";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { teams } from "@/drizzle";
import { cn } from "@/lib/utils";
import { AvatarImage } from "@/services/accounts/components/user-button/avatar-image";
import { CircularCarousel } from "./circular-carousel";
import {
	createInputsFromTrigger,
	parseFormInputs,
	toParameterItems,
} from "./helpers";

type TeamId = InferSelectModel<typeof teams>["id"];
interface TeamOption {
	value: TeamId;
	label: string;
	avatarUrl?: string;
}

type FilterType = "all" | "history" | "latest" | "favorites";
interface FilterOption {
	value: FilterType;
	label: string;
}

const filterOptions: FilterOption[] = [
	{ value: "all", label: "All" },
	{ value: "history", label: "History" },
	{ value: "latest", label: "Latest" },
	{ value: "favorites", label: "Favorites" },
];

interface FontOption {
	value: string;
	label: string;
}

const _fontOptions: FontOption[] = [
	{ value: "default", label: "Default" },
	{ value: "mono", label: "Monospace" },
	{ value: "sans", label: "Sans Serif" },
	{ value: "serif", label: "Serif" },
];

const buttonVariants = cva(
	"relative inline-flex items-center justify-center rounded-lg border-t border-b border-t-white/20 border-b-black/20 px-6 py-2 text-sm font-medium text-white shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_-1px_0_rgba(0,0,0,0.2)_inset,0_0_0_1px_rgba(255,255,255,0.08)] transition-all duration-300 hover:shadow-[0_1px_0_rgba(255,255,255,0.1)_inset,0_-1px_0_rgba(0,0,0,0.2)_inset,0_0_0_1px_rgba(255,255,255,0.1)]",
	{
		variants: {
			variant: {
				default:
					"bg-[rgba(60,90,160,0.15)] border border-white/10 shadow-[inset_0_0_12px_rgba(255,255,255,0.04)] hover:shadow-[inset_0_0_16px_rgba(255,255,255,0.06)]",
				link: "bg-black/20 border border-white/10 shadow-[inset_0_0_4px_rgba(0,0,0,0.4)] hover:shadow-[inset_0_0_6px_rgba(0,0,0,0.6)]",
				primary:
					"text-white/80 bg-gradient-to-b from-[#202530] to-[#12151f] border border-[rgba(0,0,0,0.7)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_2px_8px_rgba(5,10,20,0.4),0_1px_2px_rgba(0,0,0,0.3)] transition-all duration-200 active:scale-[0.98]",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export interface FlowTriggerUIItem {
	id: FlowTriggerId;
	teamId: TeamId;
	workspaceName: string;
	label: string;
	sdkData: FlowTrigger;
}

interface PerformStagePayloads {
	teamId: TeamId;
	flowTrigger: FlowTrigger;
	parameterItems: ParameterItem[];
}

type PerformStageAction = (payloads: PerformStagePayloads) => Promise<void>;

export function Form({
	teamOptions,
	flowTriggers,
	performStageAction,
}: {
	teamOptions: TeamOption[];
	flowTriggers: FlowTriggerUIItem[];
	performStageAction: PerformStageAction;
}) {
	const defaultTeamId = useMemo(() => teamOptions[0].value, [teamOptions]);
	const [selectedTeamId, setSelectedTeamId] = useState<TeamId>(defaultTeamId);

	const [selectedFlowTriggerId, setSelectedFlowTriggerId] = useState<
		FlowTriggerId | undefined
	>(undefined);
	const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
	const [isCarouselView, setIsCarouselView] = useState(false);
	const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

	const [validationErrors, setValidationErrors] = useState<
		Record<string, string>
	>({});

	const teamOptionsWithIcons = useMemo(
		() =>
			teamOptions.map((team) => ({
				...team,
				icon: team.avatarUrl ? (
					<AvatarImage
						avatarUrl={team.avatarUrl}
						width={24}
						height={24}
						alt={team.label}
					/>
				) : undefined,
			})),
		[teamOptions],
	);

	const filteredFlowTriggers = useMemo(
		() =>
			flowTriggers.filter(
				(flowTrigger) => flowTrigger.teamId === selectedTeamId,
			),
		[flowTriggers, selectedTeamId],
	);

	const inputs = useMemo(
		() =>
			createInputsFromTrigger(
				filteredFlowTriggers.find(
					(flowTrigger) => flowTrigger.id === selectedFlowTriggerId,
				)?.sdkData,
			),
		[selectedFlowTriggerId, filteredFlowTriggers],
	);

	const formAction = useCallback(
		async (_prevState: unknown, formData: FormData) => {
			if (selectedFlowTriggerId === undefined) {
				return null;
			}
			const { errors, values } = parseFormInputs(inputs, formData);

			if (Object.keys(errors).length > 0) {
				setValidationErrors(errors);
				return null;
			}

			setValidationErrors({});

			const flowTrigger = filteredFlowTriggers.find(
				(flowTrigger) => flowTrigger.id === selectedFlowTriggerId,
			);
			if (flowTrigger === undefined) {
				throw new Error(
					`Flow trigger with ID ${selectedFlowTriggerId} not found`,
				);
			}

			await performStageAction({
				teamId: selectedTeamId,
				flowTrigger: flowTrigger.sdkData,
				parameterItems: toParameterItems(inputs, values),
			});
			return null;
		},
		[
			inputs,
			performStageAction,
			selectedFlowTriggerId,
			selectedTeamId,
			filteredFlowTriggers,
		],
	);

	const [, action, isPending] = useActionState(formAction, null);

	return (
		<div className="max-w-[800px] mx-auto space-y-0 relative">
			{/* Team Selection Container */}
			<div className="flex justify-center gap-2">
				<div
					style={
						{
							width: "fit-content",
							minWidth: "auto",
						} as React.CSSProperties
					}
				>
					<div className="team-select">
						<Select
							id="team"
							placeholder="Select team"
							options={teamOptionsWithIcons}
							renderOption={(o) => o.label}
							value={selectedTeamId}
							onValueChange={(value) => {
								setSelectedTeamId(value as TeamId);
								setSelectedFlowTriggerId(undefined);
							}}
						/>
					</div>
				</div>
				<div className="filter-select">
					<Select
						id="filter"
						placeholder="Filter"
						options={filterOptions}
						renderOption={(o) => o.label}
						value={selectedFilter}
						onValueChange={(value) => setSelectedFilter(value as FilterType)}
					/>
				</div>
			</div>

			{/* Settings Icon */}
			<button
				type="button"
				onClick={() => setIsSettingsModalOpen(true)}
				className="absolute -top-12 right-0 p-2 rounded-lg hover:bg-white/10 transition-colors z-20"
			>
				<Settings className="w-4 h-4 text-white-400" />
			</button>

			{/* App Selection Container */}
			<div className="mt-12">
				{isCarouselView ? (
					<CircularCarousel
						items={filteredFlowTriggers.map((trigger) => ({
							id: trigger.id,
							name: trigger.workspaceName,
							profileImageUrl: undefined,
						}))}
						selectedId={selectedFlowTriggerId}
						onItemSelect={(item) => {
							setSelectedFlowTriggerId(item.id as FlowTriggerId);
						}}
						onItemDeselect={() => {
							setSelectedFlowTriggerId(undefined);
						}}
					/>
				) : (
					<div className="max-w-md mx-auto space-y-2">
						{filteredFlowTriggers.length === 0 ? (
							<div className="text-center py-8">
								<p className="text-white-400 text-sm">
									No apps available for the selected team
								</p>
							</div>
						) : (
							filteredFlowTriggers.map((trigger) => (
								<button
									key={trigger.id}
									type="button"
									onClick={() => {
										if (selectedFlowTriggerId === trigger.id) {
											setSelectedFlowTriggerId(undefined);
										} else {
											setSelectedFlowTriggerId(trigger.id);
										}
									}}
									className={clsx(
										"w-full p-4 rounded-lg border text-left transition-all",
										selectedFlowTriggerId === trigger.id
											? "border-white/20 bg-white/10 text-white-100"
											: "border-white/10 bg-white/5 text-white-400 hover:bg-white/10 hover:border-white/15",
									)}
								>
									<div className="font-medium">{trigger.workspaceName}</div>
									<div className="text-sm text-white-600 mt-1">
										{trigger.label}
									</div>
								</button>
							))
						)}
					</div>
				)}
			</div>

			{filteredFlowTriggers.length > 0 && (
				<form
					action={action}
					className="backdrop-blur-3xl rounded-2xl p-6 text-[14px] text-text resize-none outline-none relative"
					style={{
						backgroundColor: "rgba(255, 255, 255, 0.05)",
						boxShadow: `
				              0 4px 16px rgba(0, 0, 0, 0.1),
				              0 1px 4px rgba(0, 0, 0, 0.05),
				              inset 0 1px 0 rgba(255, 255, 255, 0.03)
				            `,
					}}
				>
					<div
						className="absolute inset-x-0 bottom-0 h-[1px] rounded-b-2xl"
						style={{
							background:
								"linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.03), transparent)",
						}}
					/>
					<div className="flex flex-col gap-[8px] mb-[8px]">
						{selectedFlowTriggerId === undefined ? (
							<div className="text-center py-8">
								<p className="text-white-400 text-[14px] font-medium font-['DM_Sans']">
									Please select an app to execute
								</p>
							</div>
						) : (
							inputs.map((input) => {
								return (
									<fieldset key={input.name} className={clsx("grid gap-2")}>
										<label
											className="text-[14px] font-medium text-white-900"
											htmlFor={input.name}
										>
											{input.label}
											{input.required && (
												<span className="text-red-500 ml-1">*</span>
											)}
										</label>
										{input.type === "text" && (
											<input
												type="text"
												name={input.name}
												id={input.name}
												className={clsx(
													"w-full flex justify-between items-center rounded-[8px] py-[8px] px-[12px] outline-none focus:outline-none border",
													validationErrors[input.name]
														? "border-error"
														: "border-white/5",
													"text-[14px]",
												)}
												disabled={isPending}
											/>
										)}
										{input.type === "multiline-text" && (
											<textarea
												name={input.name}
												id={input.name}
												className={clsx(
													"w-full rounded-[8px] py-[8px] px-[12px] outline-none focus:outline-none",
													"border-[1px]",
													validationErrors[input.name]
														? "border-error"
														: "border-white/5",
													"text-[14px]",
												)}
												rows={4}
												disabled={isPending}
											/>
										)}
										{input.type === "number" && (
											<input
												type="number"
												name={input.name}
												id={input.name}
												className={clsx(
													"w-full flex justify-between items-center rounded-[8px] py-[8px] px-[12px] outline-none focus:outline-none",
													"border-[1px]",
													validationErrors[input.name]
														? "border-error"
														: "border-white/5",
													"text-[14px]",
												)}
												disabled={isPending}
											/>
										)}
										{validationErrors[input.name] && (
											<span className="text-error text-[12px] font-medium">
												{validationErrors[input.name]}
											</span>
										)}
									</fieldset>
								);
							})
						)}
					</div>
					{selectedFlowTriggerId !== undefined && (
						<div className="flex items-center justify-end gap-3">
							<Button
								variant="filled"
								size="large"
								type="submit"
								disabled={isPending}
								className="!bg-blue-600 hover:!bg-blue-700 !border-blue-600 hover:!border-blue-700 [&_div]:text-[14px] [&_.size-[18px]]:text-[18px]"
								leftIcon={
									isPending && (
										<SpinnerIcon className="animate-follow-through-overlap-spin size-[18px]" />
									)
								}
							>
								{isPending ? "Setting the stage…" : "Start"}
							</Button>
						</div>
					)}
				</form>
			)}

			{/* Settings Dialog */}
			<Dialog open={isSettingsModalOpen} onOpenChange={setIsSettingsModalOpen}>
				<DialogContent>
					<div className="flex items-center justify-between mb-6">
						<DialogTitle className="text-[20px] font-medium text-white-400 tracking-tight font-sans">
							View Style
						</DialogTitle>
						<button
							type="button"
							onClick={() => setIsSettingsModalOpen(false)}
							className="p-1 rounded-lg hover:bg-white/10 transition-colors"
						>
							<X className="w-5 h-5 text-white-400" />
						</button>
					</div>

					{/* View Type Selection */}
					<div className="mb-6">
						<Label className="text-white-800 font-medium text-[12px] leading-[20.4px] font-geist">
							Display Type
						</Label>
						<RadioGroup
							value={isCarouselView ? "carousel" : "list"}
							onValueChange={(value) => setIsCarouselView(value === "carousel")}
							className="grid grid-cols-2 gap-4 mt-2"
						>
							<Card
								className={clsx(
									"cursor-pointer border-[1px]",
									!isCarouselView ? "border-blue-500" : "border-white/10",
								)}
							>
								<label htmlFor="list">
									<CardHeader>
										<div className="flex flex-col gap-2">
											<CardTitle className="text-white-400 text-[16px] leading-[27.2px] tracking-normal font-sans">
												List
											</CardTitle>
											<div className="flex items-center mb-2">
												<RadioGroupItem
													value="list"
													id="list"
													className="text-blue-500 data-[state=checked]:border-[1.5px] data-[state=checked]:border-blue-500"
												/>
											</div>
											<CardDescription className="text-black-400 font-medium text-[12px] leading-[20.4px] font-geist">
												Simple vertical list
											</CardDescription>
										</div>
									</CardHeader>
								</label>
							</Card>
							<Card
								className={clsx(
									"cursor-pointer border-[1px]",
									isCarouselView ? "border-blue-500" : "border-white/10",
								)}
							>
								<label htmlFor="carousel">
									<CardHeader>
										<div className="flex flex-col gap-2">
											<CardTitle className="text-white-400 text-[16px] leading-[27.2px] tracking-normal font-sans">
												Carousel
											</CardTitle>
											<div className="flex items-center mb-2">
												<RadioGroupItem
													value="carousel"
													id="carousel"
													className="text-blue-500 data-[state=checked]:border-[1.5px] data-[state=checked]:border-blue-500"
												/>
											</div>
											<CardDescription className="text-black-400 font-medium text-[12px] leading-[20.4px] font-geist">
												Interactive circular layout
											</CardDescription>
										</div>
									</CardHeader>
								</label>
							</Card>
						</RadioGroup>
					</div>

					{/* Font Options */}
					<div className="mb-6">
						<label
							htmlFor="font-select"
							className="block text-white-400 text-sm font-medium mb-3"
						>
							Font
						</label>
						<select
							id="font-select"
							disabled
							className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white-100 text-sm opacity-50 cursor-not-allowed"
						>
							<option className="bg-gray-900">Coming Soon</option>
						</select>
					</div>

					<DialogFooter>
						<div className="flex justify-end gap-x-3">
							<button
								type="button"
								onClick={() => setIsSettingsModalOpen(false)}
								className={cn(buttonVariants({ variant: "link" }))}
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={() => setIsSettingsModalOpen(false)}
								className={cn(buttonVariants({ variant: "primary" }))}
							>
								Continue
							</button>
						</div>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
