import clsx from "clsx/lite";
import { Popover, Tabs } from "radix-ui";
import type { ReactNode } from "react";
import { GitHubIcon, LayersIcon } from "../icons";
import { EmptyState } from "../ui/empty-state";
import {
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui";

type TabTriggerProps = Omit<
	Tabs.TabsTriggerProps,
	"value" | "children" | "className"
> & {
	icon: ReactNode;
	label: string;
};
function TabTrigger({ icon, label, ...props }: TabTriggerProps) {
	return (
		<button
			type="button"
			className={clsx(
				"relative h-[32px] rounded-[10px] px-[16px] flex items-center gap-[8px] overflow-hidden font-accent text-[14px]",
				"data-[state=active]:bg-primary-900/20 data-[state=active]:text-primary-400",
				"data-[state=active]:before:absolute data-[state=active]:before:left-0 data-[state=active]:before:w-[8px] data-[state=active]:before:bg-primary-400 data-[state=active]:before:h-full",
			)}
			{...props}
		>
			{icon}
			{label}
		</button>
	);
}

export function SettingsPanel() {
	return (
		<div className="bg-black-850 flex flex-col gap-[16px] text-white-800">
			<div>
				<p
					className="text-primary-100 font-accent text-[20px]"
					style={{ textShadow: "0px 0px 20px hsla(207, 100%, 48%, 1)" }}
				>
					Agent Settings
				</p>
			</div>
			<Tabs.Root orientation="horizontal" className="flex gap-[24px]">
				<Tabs.List
					className={clsx("flex flex-col gap-[10px] px-[8px] w-[240px]")}
				>
					<Tabs.Trigger value="agent-details" asChild>
						<TabTrigger
							label="Agent Details"
							icon={<LayersIcon className="size-[16px]" />}
						/>
					</Tabs.Trigger>
					<Tabs.Trigger value="github-integration" asChild>
						<TabTrigger
							label="GitHub Integration"
							icon={<GitHubIcon className="size-[16px]" />}
						/>
					</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="agent-details">
					<p>Ae</p>
				</Tabs.Content>
				<Tabs.Content value="github-integration" className="flex-1">
					<div className="flex flex-col gap-[16px]">
						<h2 className="text-[14px] font-accent font-[700] text-white-400">
							GitHub Integration
						</h2>
						<form className="w-full">
							<div className="grid grid-cols-[140px_1fr] gap-x-[4px] gap-y-[16px]">
								<h3 className="relative font-accent text-white-400 text-[14px] flex items-center font-bold">
									Repository
								</h3>
								<div>
									<fieldset className="flex flex-col gap-[4px]">
										<Select>
											<SelectTrigger>
												<SelectValue placeholder="Select a repository" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="apple">Apple</SelectItem>
												<SelectItem value="banana">Banana</SelectItem>
												<SelectItem value="blueberry">Blueberry</SelectItem>
												<SelectItem value="grapes">Grapes</SelectItem>
												<SelectItem value="pineapple">Pineapple</SelectItem>
											</SelectContent>
										</Select>
									</fieldset>
								</div>
								<h3 className="font-accent text-white-400 text-[14px] font-bold">
									<div className="flex items-center">Trigger</div>
								</h3>
								<div className="flex flex-col gap-[16px]">
									<fieldset className="flex flex-col gap-[4px]">
										<Label>Event</Label>
										<Select>
											<SelectTrigger>
												<SelectValue placeholder="Select a repository" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="apple">Apple</SelectItem>
												<SelectItem value="banana">Banana</SelectItem>
												<SelectItem value="blueberry">Blueberry</SelectItem>
												<SelectItem value="grapes">Grapes</SelectItem>
												<SelectItem value="pineapple">Pineapple</SelectItem>
											</SelectContent>
										</Select>
									</fieldset>
									<fieldset className="flex flex-col gap-[4px]">
										<Label>Callsign</Label>
										<input
											type="text"
											className="bg-black-750 h-[28px] border-[1px] border-white-950/10 flex items-center px-[12px] text-[12px] rounded-[8px] outline-none placeholder::text-white-200"
											placeholder="Enter call sign"
										/>
									</fieldset>
								</div>
								<h3 className="font-accent text-white-400 text-[14px] font-bold">
									Data mapping
								</h3>
								<div>
									{/* <button
										type="button"
										className="p-[16px] flex flex-col gap-[8px] bg-black-400/10 rounded-[8px] py-[24px] px-[24px] flex items-center justify-center w-full border-[1px] border-transparent hover:border-black-400 cursor-pointer outline-none"
									>
										<p className="text-black-400">No data mapped</p>
										<div className="rounded-full size-[20px] bg-primary-200 flex justify-center items-center text-black-900">
											+
										</div>
									</button> */}

									<div className="grid grid-cols-[200px_20px_200px] gap-x-[8px] gap-y-[8px]">
										<Label>Event data</Label>
										<div />
										<Label>Node</Label>
										<div className="col-span-3 grid grid-cols-[200px_20px_200px] gap-[8px] items-center h-[28px] bg-black-750 rounded-[8px] text-[14px] border-[1px] border-white-950/10">
											<p className="w-[200px] px-[12px] ">issue.comment</p>
											<div className="w-[20px] flex justify-center text-primary-800 ">
												→
											</div>
											<p className="w-[200px] px-[12px] ">Issue comment</p>
										</div>

										<fieldset className="flex flex-col gap-[4px]">
											<Select>
												<SelectTrigger>
													<SelectValue placeholder="Select a repository" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="apple">Apple</SelectItem>
													<SelectItem value="banana">Banana</SelectItem>
													<SelectItem value="blueberry">Blueberry</SelectItem>
													<SelectItem value="grapes">Grapes</SelectItem>
													<SelectItem value="pineapple">Pineapple</SelectItem>
												</SelectContent>
											</Select>
										</fieldset>
										<p className="text-primary-800 text-[16px] flex justify-center">
											→
										</p>
										<fieldset className="flex flex-col gap-[4px]">
											<Select>
												<SelectTrigger>
													<SelectValue placeholder="Select a repository" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="apple">Apple</SelectItem>
													<SelectItem value="banana">Banana</SelectItem>
													<SelectItem value="blueberry">Blueberry</SelectItem>
													<SelectItem value="grapes">Grapes</SelectItem>
													<SelectItem value="pineapple">Pineapple</SelectItem>
												</SelectContent>
											</Select>
										</fieldset>
									</div>

									{/* <EmptyState title="Nodata mapped">
										<Popover.Root>
											<Popover.Trigger
												type="button"
												className={clsx(
													"flex items-center cursor-pointer p-[10px] rounded-[8px]",
													"border border-transparent hover:border-white-800",
													"text-[12px] font-[700] text-white-800",
													"transition-colors",
												)}
											>
												Add Data mapping
											</Popover.Trigger>
											<Popover.Portal>
												<Popover.Content
													side="left"
													className="rounded-[8px] bg-black-850 p-[16px] border-[0.5px] border-black-400 shadow-black-300 focus:outline-none overflow-hidden"
												>
													<div className="flex flex-col gap-[8px]">
														<h3 className="text-[16px] font-[700] font-accent text-white-800">
															Add Data Mapping
														</h3>

														<div className="flex items-center gap-[8px]">
															<fieldset className="flex flex-col gap-[4px] flex-1 w-[200px]">
																<Label>Event data</Label>
																<Select>
																	<SelectTrigger>
																		<SelectValue placeholder="Select a repository" />
																	</SelectTrigger>
																	<SelectContent>
																		<SelectItem value="apple">Apple</SelectItem>
																		<SelectItem value="banana">
																			Banana
																		</SelectItem>
																		<SelectItem value="blueberry">
																			Blueberry
																		</SelectItem>
																		<SelectItem value="grapes">
																			Grapes
																		</SelectItem>
																		<SelectItem value="pineapple">
																			Pineapple
																		</SelectItem>
																	</SelectContent>
																</Select>
															</fieldset>
															<p className="text-primary-800 text-[16px] mt-[20px]">
																→
															</p>
															<fieldset className="flex flex-col gap-[4px] flex-1 w-[200px]">
																<Label>Node</Label>
																<Select>
																	<SelectTrigger>
																		<SelectValue placeholder="Select a repository" />
																	</SelectTrigger>
																	<SelectContent>
																		<SelectItem value="apple">Apple</SelectItem>
																		<SelectItem value="banana">
																			Banana
																		</SelectItem>
																		<SelectItem value="blueberry">
																			Blueberry
																		</SelectItem>
																		<SelectItem value="grapes">
																			Grapes
																		</SelectItem>
																		<SelectItem value="pineapple">
																			Pineapple
																		</SelectItem>
																	</SelectContent>
																</Select>
															</fieldset>
														</div>
														<button
															type="button"
															className="h-[28px] rounded-[8px] bg-white-800 mt-[8px] text-[14px] cursor-pointer"
														>
															Add Mapping
														</button>
													</div>
												</Popover.Content>
											</Popover.Portal>
										</Popover.Root>
									</EmptyState> */}
								</div>
								<h3 className="font-accent text-white-400 text-[14px] font-bold">
									Then
								</h3>
								<fieldset className="flex flex-col gap-[4px]">
									<Select>
										<SelectTrigger>
											<SelectValue placeholder="Select a repository" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="apple">Apple</SelectItem>
											<SelectItem value="banana">Banana</SelectItem>
											<SelectItem value="blueberry">Blueberry</SelectItem>
											<SelectItem value="grapes">Grapes</SelectItem>
											<SelectItem value="pineapple">Pineapple</SelectItem>
										</SelectContent>
									</Select>
								</fieldset>
							</div>
							<button
								type="button"
								className="h-[28px] rounded-[8px] bg-white-800 text-[14px] cursor-pointer text-black-800 font-[700] px-[16px] font-accent"
							>
								Save
							</button>
						</form>
					</div>
				</Tabs.Content>
			</Tabs.Root>
		</div>
	);
}
