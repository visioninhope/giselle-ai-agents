"use client";

import { Input } from "@/components/ui/input";
import type { Team } from "@/services/teams/types";
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import {
	type InferInput,
	maxLength,
	minLength,
	parse,
	pipe,
	string,
} from "valibot";
import { Button } from "../components/button";
import { Card } from "../components/card";
import { updateTeamName } from "./actions";

const TeamNameSchema = pipe(
	string(),
	minLength(1, "Team name is required"),
	maxLength(256, "Team name must be 256 characters or less"),
);

type TeamNameSchema = InferInput<typeof TeamNameSchema>;

export function TeamNameForm({ id: teamId, name }: Team) {
	const [isEditingTeam, setIsEditingTeam] = useState(false);
	const [teamName, setTeamName] = useState(name);
	const [tempTeamName, setTempTeamName] = useState(teamName);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string>("");

	const handleSaveTeamName = async () => {
		setError("");

		try {
			const validatedName = parse(TeamNameSchema, tempTeamName);

			setIsLoading(true);

			const formData = new FormData();
			formData.append("name", validatedName);
			const formAction = updateTeamName.bind(null, teamId);
			const result = await formAction(formData);

			if (result.success) {
				setTeamName(validatedName);
				setIsEditingTeam(false);
			} else {
				setError("Failed to update team name");
				console.error("Failed to update team name");
			}
		} catch (error) {
			if (error instanceof Error) {
				setError(error.message);
			}
			console.error("Error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancelTeamName = () => {
		setTempTeamName(teamName);
		setIsEditingTeam(false);
		setError("");
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setError("");
		setTempTeamName(e.target.value);
	};

	return (
		<Card
			title="Team Name"
			description="This is your team's display name in Giselle. You can use your company name or department."
			action={{
				component: (
					<Dialog.Root open={isEditingTeam} onOpenChange={setIsEditingTeam}>
						<Dialog.Trigger asChild>
							<Button
								className="rounded-lg px-4 py-2 text-white/80 transition-all duration-200 active:scale-[0.98]"
								style={{
									background:
										"linear-gradient(180deg, #202530 0%, #12151f 100%)",
									border: "1px solid rgba(0,0,0,0.7)",
									boxShadow:
										"inset 0 1px 1px rgba(255,255,255,0.05), 0 2px 8px rgba(5,10,20,0.4), 0 1px 2px rgba(0,0,0,0.3)",
								}}
							>
								Edit
							</Button>
						</Dialog.Trigger>
						<Dialog.Portal>
							<Dialog.Overlay className="fixed inset-0 bg-black/60 z-50" />
							<div className="fixed inset-0 flex items-center justify-center z-50 p-4">
								<Dialog.Content
									className="w-[90vw] max-w-[420px] max-h-[90vh] overflow-y-auto rounded-[12px] p-6 relative shadow-xl focus:outline-none"
									onEscapeKeyDown={handleCancelTeamName}
									onPointerDownOutside={handleCancelTeamName}
								>
									{/* Glass effect layers */}
									<div
										className="absolute inset-0 rounded-[12px] backdrop-blur-md"
										style={{
											background:
												"linear-gradient(135deg, rgba(150, 150, 150, 0.03) 0%, rgba(60, 90, 160, 0.12) 100%)",
										}}
									/>
									<div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
									<div className="absolute inset-0 rounded-[12px] border border-white/10" />

									<div className="relative z-10 space-y-6">
										<div className="flex justify-between items-center">
											<Dialog.Title className="text-[20px] font-medium text-white-400 tracking-tight font-sans">
												Change Your Team Name
											</Dialog.Title>
										</div>

										<form
											className="flex flex-col gap-y-4"
											onSubmit={(e) => {
												e.preventDefault();
												handleSaveTeamName();
											}}
										>
											<div className="flex flex-col gap-y-2">
												<Input
													id="tempTeamName"
													value={tempTeamName}
													onChange={handleChange}
													className="h-11 px-4 rounded-lg text-white placeholder-white/40 focus:ring-0 focus:outline-none"
													style={{
														background: "#00020A",
														boxShadow: "inset 0 1px 4px rgba(0,0,0,0.5)",
													}}
													disabled={isLoading}
												/>
												{error && (
													<p className="text-[12px] leading-[20.4px] text-error-900 font-geist">
														{error}
													</p>
												)}
											</div>
											<div className="flex justify-end space-x-2">
												<Button
													type="button"
													variant="link"
													onClick={handleCancelTeamName}
													disabled={isLoading}
												>
													Cancel
												</Button>
												<Button type="submit" disabled={isLoading || !!error}>
													{isLoading ? "Saving..." : "Save"}
												</Button>
											</div>
										</form>
									</div>
								</Dialog.Content>
							</div>
						</Dialog.Portal>
					</Dialog.Root>
				),
			}}
			className="px-[24px] py-[16px]"
		>
			<span
				className="text-primary-100 font-normal text-[16px] font-sans px-3 py-2 rounded-[4px] w-[360px] truncate"
				style={{
					background: "#00020A",
					boxShadow: "inset 0 1px 4px rgba(0,0,0,0.5)",
				}}
			>
				{teamName}
			</span>
		</Card>
	);
}
