"use client";

import {
	Alert,
	AlertDescription,
} from "@/app/(main)/settings/components/alert";
import { Button } from "@/app/(main)/settings/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { AlertCircle, UserPlus } from "lucide-react";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { createTeam } from "../actions/create-team";

function Submit({
	selectedPlan,
	teamName,
}: { selectedPlan: string; teamName: string }) {
	const { pending } = useFormStatus();
	return (
		<Button
			type="submit"
			variant="default"
			className="h-[38px] w-full transition-colors duration-200 border-0 disabled:border-0 disabled:bg-black-400 disabled:text-black-600 hover:border-[1px] hover:border-white"
			disabled={pending || !teamName || !selectedPlan}
		>
			{selectedPlan === "pro" ? "Proceed to Payment" : "Create Team"}
		</Button>
	);
}

interface TeamCreationFormProps {
	canCreateFreeTeam: boolean;
	proPlanPrice: string;
	children?: React.ReactNode;
}

export function TeamCreationForm({
	canCreateFreeTeam,
	proPlanPrice,
	children,
}: TeamCreationFormProps) {
	const [teamName, setTeamName] = useState("");
	// If free plan is not available, set "pro" as initial value, otherwise empty string
	const [selectedPlan, setSelectedPlan] = useState(
		canCreateFreeTeam ? "" : "pro",
	);

	return (
		<Dialog>
			<DialogTrigger asChild className="cursor-pointer">
				{children ?? (
					<UserPlus className="h-6 w-6 text-white hover:opacity-80" />
				)}
			</DialogTrigger>
			<DialogContent
				className={cn(
					"sm:max-w-[500px] gap-y-6 px-8 py-6 border-[0.5px] border-black-400 rounded-[8px] bg-black-900",
				)}
				style={{
					animation: "fadeIn 0.2s ease-out",
					transformOrigin: "center",
				}}
			>
				<style jsx global>{`
					@keyframes fadeIn {
						from {
							opacity: 0;
							transform: scale(0.95);
						}
						to {
							opacity: 1;
							transform: scale(1);
						}
					}
				`}</style>
				<DialogHeader>
					<DialogTitle className="text-white-800 font-semibold text-[20px] leading-[28px] font-sans text-center">
						Create New Team
					</DialogTitle>
				</DialogHeader>

				<form action={createTeam} className="space-y-4">
					<div className="flex flex-col gap-y-2">
						<Label
							htmlFor="teamName"
							className="text-white-800 font-medium text-[12px] leading-[20.4px] font-geist"
						>
							Team Name
						</Label>
						<div className="flex items-start bg-transparent p-0 rounded-lg">
							<Input
								id="teamName"
								name="teamName"
								value={teamName}
								onChange={(e) => setTeamName(e.target.value)}
								className="w-full bg-transparent border-[0.5px] border-black-800 rounded-[8px] text-white-850 font-medium text-[14px] leading-[20.4px] font-geist shadow-none p-3 focus:ring-0 placeholder:text-black-400"
								placeholder="Enter team name"
							/>
						</div>
					</div>
					<div className="space-y-4">
						<div className="flex flex-col gap-y-2">
							<Label className="text-white-800 font-medium text-[12px] leading-[20.4px] font-geist">
								{canCreateFreeTeam ? "Select Plan" : "Pro Plan"}
							</Label>
							{canCreateFreeTeam ? (
								<RadioGroup
									name="selectedPlan"
									value={selectedPlan}
									onValueChange={setSelectedPlan}
									className="grid grid-cols-2 gap-4"
								>
									<Card
										className={
											"bg-black-850 border-[0.5px] border-black-400 cursor-pointer"
										}
									>
										<label htmlFor="free">
											<CardHeader>
												<div className="flex flex-col gap-2">
													<CardTitle className="text-white-400 text-[16px] leading-[27.2px] tracking-normal font-sans">
														Free
													</CardTitle>
													<div className="flex items-center mb-2">
														<RadioGroupItem
															value="free"
															id="free"
															className="text-blue-500 data-[state=checked]:border-[1.5px] data-[state=checked]:border-blue-500"
														/>
														<Label
															htmlFor="free"
															className="ml-2 text-white-800 font-geist text-[16px]"
														>
															$0/month
														</Label>
													</div>
													<CardDescription className="text-white-400 font-semibold text-[12px] leading-[20.4px] font-geist">
														Basic features for personal use
													</CardDescription>
													<CardDescription className="text-black-400 font-medium text-[12px] leading-[20.4px] font-geist">
														Includes 30 minutes of model usage time and access
														to basic models for your individual projects.
													</CardDescription>
												</div>
											</CardHeader>
										</label>
									</Card>
									<Card className="bg-black-850 border-[0.5px] border-black-400 cursor-pointer">
										<label htmlFor="pro">
											<CardHeader>
												<div className="flex flex-col gap-2">
													<CardTitle className="text-primary-400 text-[16px] leading-[27.2px] tracking-normal font-sans">
														Pro
													</CardTitle>
													<div className="flex items-center mb-2">
														<RadioGroupItem
															value="pro"
															id="pro"
															className="text-primary-900 data-[state=checked]:border-[1.5px] data-[state=checked]:border-primary-900"
														/>
														<Label
															htmlFor="pro"
															className="ml-2 text-white-800 font-geist text-[16px]"
														>
															{proPlanPrice}/month
														</Label>
													</div>
													<CardDescription className="text-white-400 font-semibold text-[12px] leading-[20.4px] font-geist">
														Advanced features & support
													</CardDescription>
													<CardDescription className="text-black-400 font-medium text-[12px] leading-[20.4px] font-geist">
														When you create a team, all member seat charges will
														be billed to you. Share apps with multiple team
														members and gain access to premium models, all with
														enhanced support.
													</CardDescription>
												</div>
											</CardHeader>
										</label>
									</Card>
								</RadioGroup>
							) : (
								<div className="w-full">
									<input type="hidden" name="selectedPlan" value="pro" />
									<Card className="bg-black-850 border-[0.5px] border-black-400 w-full">
										<CardHeader>
											<div className="flex flex-col gap-2">
												<CardTitle className="text-primary-400 text-[16px] leading-[27.2px] tracking-normal font-sans">
													Pro
												</CardTitle>
												<div className="flex items-center mb-2">
													<div className="size-4 rounded-full border-[1.5px] border-primary-900 flex items-center justify-center">
														<div className="size-2 rounded-full bg-primary-900" />
													</div>
													<Label
														htmlFor="pro"
														className="ml-2 text-white-800 font-geist text-[16px]"
													>
														{proPlanPrice}/month
													</Label>
												</div>
												<CardDescription className="text-white-400 font-semibold text-[12px] leading-[20.4px] font-geist">
													Advanced features & support
												</CardDescription>
												<CardDescription className="text-black-400 font-medium text-[12px] leading-[20.4px] font-geist">
													When you create a team, all member seat charges will
													be billed to you. Share apps with multiple team
													members and gain access to premium models, all with
													enhanced support.
												</CardDescription>
											</div>
										</CardHeader>
									</Card>
								</div>
							)}
						</div>
					</div>
					<Submit selectedPlan={selectedPlan} teamName={teamName} />
				</form>
			</DialogContent>
		</Dialog>
	);
}
