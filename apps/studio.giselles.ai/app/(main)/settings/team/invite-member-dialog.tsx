"use client";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TeamRole } from "@/drizzle";
import { cn } from "@/lib/utils";
import * as Dialog from "@radix-ui/react-dialog";
import {
	ChevronDown,
	X,
	Copy,
	Ellipsis,
	RefreshCw,
	Trash2,
	Plus,
	Check,
} from "lucide-react";
import { useEffect, useState } from "react";
import { email as emailValidator, parse, pipe, string } from "valibot";
import { Button } from "../components/button";
import { type SendInvitationsResult, sendInvitationsAction } from "./actions";

type InviteMemberDialogProps = {
	memberEmails: string[];
	invitationEmails: string[];
};

export function InviteMemberDialog({
	memberEmails,
	invitationEmails,
}: InviteMemberDialogProps) {
	const [open, setOpen] = useState(false);
	const [emailInput, setEmailInput] = useState("");
	const [emailList, setEmailList] = useState<string[]>([]);
	const [role, setRole] = useState<TeamRole>("member");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string>("");
	const [dialogKey, setDialogKey] = useState(Date.now()); // Key for forced re-rendering

	// Reset state when dialog state changes
	useEffect(() => {
		if (!open) {
			// Reset state when dialog is closed
			setEmailInput("");
			setEmailList([]);
			setRole("member");
			setError("");
			setIsLoading(false);
		}
	}, [open]);

	const handleOpenDialog = () => {
		setOpen(true);
		setDialogKey(Date.now()); // Update key to force re-rendering
	};

	const handleCloseDialog = () => {
		setOpen(false);
	};

	const addEmail = (emailToAdd: string) => {
		const trimmedEmail = emailToAdd.trim();
		if (!trimmedEmail) return;

		// Email format validation
		try {
			parse(pipe(string(), emailValidator()), trimmedEmail);
			// Check for duplicates
			if (
				!emailList.includes(trimmedEmail) &&
				!memberEmails.includes(trimmedEmail) &&
				!invitationEmails.includes(trimmedEmail)
			) {
				setEmailList((prev) => [...prev, trimmedEmail]);
			}
			setEmailInput("");
		} catch {
			setError(`Invalid email address: ${trimmedEmail}`);
		}
	};

	const removeEmail = (email: string) => {
		setEmailList((prev) => prev.filter((e) => e !== email));
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" || e.key === ",") {
			e.preventDefault();
			addEmail(emailInput);
		}
	};

	const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
		e.preventDefault();
		const pastedText = e.clipboardData.getData("text");
		const emails = pastedText.split(/[,;\s]+/);

		for (const email of emails) {
			if (email) addEmail(email);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (emailInput.trim()) {
			addEmail(emailInput);
		}

		if (emailList.length === 0) {
			setError("Please enter at least one email address");
			return;
		}

		setIsLoading(true);

		const response: SendInvitationsResult = await sendInvitationsAction(
			emailList,
			role,
		);

		if (response.overallStatus === "success") {
			handleCloseDialog();
		} else {
			const failedInvites = response.results.filter(
				(r) => r.status !== "success",
			);
			const errorMessages = failedInvites
				.map((r) => `${r.email}: ${r.error || r.status}`)
				.join(", ");
			let message = `Failed to send ${failedInvites.length} invitation(s).`;
			if (response.overallStatus === "partial_success") {
				const successCount = emailList.length - failedInvites.length;
				message = `${successCount} invitation(s) sent successfully. Failed to send ${failedInvites.length}: ${errorMessages}`;
			} else {
				message = `Failed to send all ${failedInvites.length} invitation(s): ${errorMessages}`;
			}
			setError(message);
		}
		setIsLoading(false);
	};

	return (
		<Dialog.Root open={open} onOpenChange={setOpen} key={dialogKey}>
			<Dialog.Trigger asChild>
				<button
					type="button"
					onClick={handleOpenDialog}
					className="group relative overflow-hidden rounded-lg px-4 py-2 text-white transition-all duration-300 hover:scale-[1.01] active:scale-95"
					style={{
						boxShadow:
							"0 8px 20px rgba(107, 143, 240, 0.2), 0 3px 10px rgba(107, 143, 240, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.08)",
					}}
				>
					{/* Outer glow */}
					<div
						className="absolute inset-0 rounded-lg blur-[2px] -z-10"
						style={{ backgroundColor: "#6B8FF0", opacity: 0.08 }}
					/>

					{/* Main glass background */}
					<div
						className="absolute inset-0 rounded-lg backdrop-blur-md"
						style={{
							background:
								"linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(107,143,240,0.1) 50%, rgba(107,143,240,0.2) 100%)",
						}}
					/>

					{/* Top reflection */}
					<div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

					{/* Subtle border */}
					<div className="absolute inset-0 rounded-lg border border-white/20" />

					{/* Content */}
					<span className="relative z-10 flex items-center gap-2">
						<span className="grid place-items-center rounded-full size-4 bg-primary-200 opacity-50">
							<Plus className="size-3 text-black-900" />
						</span>
						<span className="text-[14px] leading-[20px] font-medium">Invite Member</span>
					</span>

					{/* Hover overlay */}
					<div className="absolute inset-0 rounded-lg bg-gradient-to-t from-transparent to-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
				</button>
			</Dialog.Trigger>

			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/60 z-50" />
				<div className="fixed inset-0 flex items-center justify-center z-50 p-4">
					<Dialog.Content
						className={cn(
							"w-[90vw] max-w-[500px] max-h-[90vh] overflow-y-auto rounded-[12px] p-6 relative",
							"shadow-xl focus:outline-none",
						)}
						onEscapeKeyDown={handleCloseDialog}
						onPointerDownOutside={handleCloseDialog}
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

						<div className="relative z-10">
							<div className="flex justify-between items-center">
								<Dialog.Title className="text-[20px] font-medium text-white-400 tracking-tight font-sans">
									Invite Team Member
								</Dialog.Title>
								<Dialog.Close className="rounded-sm opacity-70 text-white-400 hover:opacity-100 focus:outline-none">
									<X className="h-5 w-5" />
									<span className="sr-only">Close</span>
								</Dialog.Close>
							</div>
							<Dialog.Description className="text-[14px] text-black-400 font-geist mt-2">
								Each member added to your team will be charged as an additional
								seat ($20 per seat) on your Pro Plan subscription.
							</Dialog.Description>

							<form onSubmit={handleSubmit} className="space-y-4 mt-4" noValidate>
								<div className="flex items-start gap-3 bg-black/80 p-1 rounded-lg">
									<div className="flex-grow flex flex-wrap items-center gap-1 min-h-[40px]">
										{emailList.map((email) => (
											<div
												key={email}
												className="flex items-center bg-white/10 rounded-md px-2.5 py-1.5 mr-2 mb-1 shadow-sm"
											>
												<span className="text-white-400 text-[14px] max-w-[180px] truncate">
													{email}
												</span>
												<button
													type="button"
													onClick={() => removeEmail(email)}
													className="ml-1.5 text-black-300 hover:text-white-600"
												>
													<X className="h-4 w-4" />
												</button>
											</div>
										))}
										<input
											type="text"
											placeholder={
												emailList.length > 0
													? ""
													: "Email Addresses (separate with commas)"
											}
											value={emailInput}
											onChange={(e) => {
												setError("");
												setEmailInput(e.target.value);
											}}
											onKeyDown={handleKeyDown}
											onPaste={handlePaste}
											className="flex-1 bg-transparent border-none outline-none text-white-400 placeholder-white/30 px-1 py-1 min-w-[200px] text-[14px]"
											disabled={isLoading}
										/>
									</div>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<button
												type="button"
												className="flex items-center gap-1 text-white-400 font-medium text-[14px] leading-[16px] font-sans hover:text-white-100 hover:bg-white/5 rounded-md px-3 h-10"
												disabled={isLoading}
											>
												<span className="capitalize">{role}</span>
												<ChevronDown className="h-4 w-4 opacity-60" />
											</button>
										</DropdownMenuTrigger>
										<DropdownMenuContent
											align="end"
											className="p-1 border-[0.25px] border-white/10 rounded-[8px] min-w-[120px] bg-black-850 shadow-none"
										>
											<button
												type="button"
												onClick={() => setRole("admin")}
												className="flex items-center w-full px-3 py-2 text-left text-[14px] leading-[16px] hover:bg-white/5 text-white-400 capitalize rounded-md"
											>
												<span className="inline-flex justify-center items-center w-4 h-4 mr-2">
													{role === "admin" && <Check className="h-4 w-4" />}
												</span>
												Admin
											</button>
											<button
												type="button"
												onClick={() => setRole("member")}
												className="flex items-center w-full px-3 py-2 text-left text-[14px] leading-[16px] hover:bg-white/5 text-white-400 capitalize rounded-md"
											>
												<span className="inline-flex justify-center items-center w-4 h-4 mr-2">
													{role === "member" && <Check className="h-4 w-4" />}
												</span>
												Member
											</button>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
								{error && (
									<div className="text-error-500 text-sm mt-1">{error}</div>
								)}

								<div className="flex justify-end items-center mt-6">
									<div className="flex w-full max-w-[280px] space-x-2">
										<Button
											variant="link"
											onClick={handleCloseDialog}
											type="button"
											className="flex-1"
										>
											Cancel
										</Button>
										<Button
											type="submit"
											disabled={isLoading}
											className="flex-1 rounded-lg px-4 py-2 text-white/80 transition-all duration-200 active:scale-[0.98]"
											style={{
												background:
													"linear-gradient(180deg, #202530 0%, #12151f 100%)",
												border: "1px solid rgba(0,0,0,0.7)",
												boxShadow:
													"inset 0 1px 1px rgba(255,255,255,0.05), 0 2px 8px rgba(5,10,20,0.4), 0 1px 2px rgba(0,0,0,0.3)",
											}}
										>
											{isLoading ? "Sending..." : "Invite"}
										</Button>
									</div>
								</div>
							</form>
						</div>
					</Dialog.Content>
				</div>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
