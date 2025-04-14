"use client";

import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { TeamRole } from "@/drizzle";
import { cn } from "@/lib/utils";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronDown, Link as LinkIcon, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
	type InferInput,
	email as emailValidator,
	maxLength,
	minLength,
	object,
	parse,
	picklist,
	pipe,
	string,
} from "valibot";
import { Button } from "../components/button";
import { addTeamMember } from "./actions";

const TeamMemberSchema = object({
	email: pipe(
		string(),
		minLength(1, "Please enter an email address"),
		maxLength(256, "Email must be 256 characters or less"),
	),
	role: picklist(["admin", "member"] as const),
});

type TeamMemberSchema = InferInput<typeof TeamMemberSchema>;

// Global variable to store invited members (for UI demo)
// In actual implementation, this should be fetched from the server or managed with a state management library
let invitedMembersList: { email: string; role: TeamRole }[] = [];

// Function to get invited members (for UI demo)
export function getInvitedMembers() {
	// Try to get from localStorage first
	try {
		const stored = localStorage.getItem("invitedMembers");
		if (stored) {
			invitedMembersList = JSON.parse(stored);
		}
	} catch (e) {
		console.error("Failed to load invited members from localStorage:", e);
	}
	return invitedMembersList;
}

// Function to save invited members (for UI demo)
function saveInvitedMembers(list: { email: string; role: TeamRole }[]) {
	invitedMembersList = list;
	try {
		localStorage.setItem("invitedMembers", JSON.stringify(list));
	} catch (e) {
		console.error("Failed to save invited members to localStorage:", e);
	}
}

export function InviteMemberDialog() {
	const [open, setOpen] = useState(false);
	const [emailInput, setEmailInput] = useState("");
	const [emailList, setEmailList] = useState<string[]>([]);
	const [role, setRole] = useState("member");
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
			if (!emailList.includes(trimmedEmail)) {
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

		try {
			setIsLoading(true);

			// For UI demo: Add to list without server communication
			const newList = [...invitedMembersList];
			for (const email of emailList) {
				// Check for duplicates
				if (!newList.some((member) => member.email === email)) {
					newList.push({ email, role: role as TeamRole });
				}
			}
			saveInvitedMembers(newList);

			/* Actual API communication code (commented out) - to be implemented by engineers
			// Process for each email address
			const results = await Promise.all(
				emailList.map(async (emailAddress) => {
					const formData = new FormData();
					formData.append("email", emailAddress);
					formData.append("role", role);
					return addTeamMember(formData);
				})
			);

			// Check for errors
			const errors = results.filter(result => !result.success);
			if (errors.length > 0) {
				setError(`Failed to add ${errors.length} member(s). ${errors[0].error || ''}`);
			} else {
				handleCloseDialog(); // Close dialog on success
			}
			*/

			// Always emit the event to refresh the list, even if server-side errors occurred
			const event = new CustomEvent("invited-members-updated");
			window.dispatchEvent(event);

			// Assuming success for the demo
			setTimeout(() => {
				handleCloseDialog(); // Close dialog on success
			}, 500); // Process after 0.5 seconds (for loading indicator)
		} catch (error) {
			if (error instanceof Error) {
				setError(error.message);
			}
			console.error("Error:", error);

			// Even on error, try to refresh the list (the error might be with one email but others added)
			const event = new CustomEvent("invited-members-updated");
			window.dispatchEvent(event);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog.Root open={open} onOpenChange={setOpen} key={dialogKey}>
			<Dialog.Trigger asChild>
				<button
					type="button"
					onClick={handleOpenDialog}
					className="bg-primary-200 hover:bg-primary-100 text-black-900 font-bold py-2 px-4 rounded-md font-hubot cursor-pointer border border-primary-200"
				>
					Invite Member +
				</button>
			</Dialog.Trigger>

			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/80 opacity-100" />
				<Dialog.Content
					className={cn(
						"fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
						"w-[90vw] max-w-[500px] rounded-[8px] bg-black-900 p-6",
						"border border-black-400 shadow-lg focus:outline-none",
						"opacity-100 scale-100",
					)}
					onEscapeKeyDown={handleCloseDialog}
					onPointerDownOutside={handleCloseDialog}
				>
					<div className="flex flex-col space-y-1.5 text-center sm:text-left">
						<Dialog.Title className="text-[20px] font-medium text-white-400 tracking-tight font-hubot">
							Invite Team Member
						</Dialog.Title>
						<Dialog.Description className="text-[14px] text-black-400 font-geist">
							Each member added to your team will be charged as an additional
							seat ($20 per seat) on your Pro Plan subscription.
						</Dialog.Description>
					</div>

					<form onSubmit={handleSubmit} className="space-y-4 mt-4" noValidate>
						<div className="flex items-start gap-3 bg-black-900 p-4 rounded-lg border border-black-800">
							<div className="flex-grow flex flex-wrap items-center gap-1 min-h-[40px]">
								{emailList.map((email) => (
									<div
										key={email}
										className="flex items-center bg-black-850 border-[0.5px] border-black-400 rounded-md px-2 py-1 mr-2 mb-1"
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
									onBlur={() => {
										if (emailInput.trim()) {
											addEmail(emailInput);
										}
									}}
									className="flex-grow bg-transparent border-none outline-none text-white-400 font-medium text-[14px] leading-[20.4px] font-geist placeholder:text-black-400 py-1.5 min-w-[120px]"
									disabled={isLoading}
								/>
							</div>

							<div className="pt-1">
								<Select
									value={role}
									onValueChange={(value) => {
										setError("");
										setRole(value);
									}}
									disabled={isLoading}
								>
									<SelectTrigger
										id="role"
										className="w-[120px] px-3 py-1.5 border-[0.5px] border-black-700 rounded-md h-9 bg-black-850 text-white-900 shadow-none [&_svg]:opacity-100 cursor-pointer focus:ring-0 focus:ring-offset-0 focus:outline-none focus:border-black-600"
									>
										<SelectValue />
										<ChevronDown className="h-4 w-4 opacity-50 ml-1" />
									</SelectTrigger>
									<SelectContent className="border-[0.5px] border-black-700 rounded-md bg-black-850 text-white-900 font-hubot">
										<SelectItem
											value="admin"
											className="py-2 pr-2 font-medium text-[14px] leading-[20.4px] transition duration-300 ease-out cursor-pointer focus:bg-black-700"
										>
											Admin
										</SelectItem>
										<SelectItem
											value="member"
											className="py-2 pr-2 font-medium text-[14px] leading-[20.4px] transition duration-300 ease-out cursor-pointer focus:bg-black-700"
										>
											Member
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						{error && (
							<p className="text-[12px] leading-[20.4px] text-error-900 font-geist">
								{error}
							</p>
						)}

						<div className="flex justify-between items-center mt-6">
							<div>
								<button
									type="button"
									className="text-black-300 hover:text-white-400 p-2 rounded-full hover:bg-black-800/40 flex items-center gap-1"
									onClick={() => {
										/* Share function is empty */
									}}
								>
									<LinkIcon className="h-4 w-4" />
									<span className="text-sm font-medium">Share</span>
								</button>
							</div>
							<div className="flex space-x-2">
								<Button
									variant="link"
									onClick={handleCloseDialog}
									type="button"
									className="bg-transparent border-[0.5px] border-black-400 text-white-400 hover:bg-black-800"
								>
									Cancel
								</Button>
								<Button type="submit" disabled={isLoading} className="px-8">
									{isLoading ? "Sending..." : "Invite"}
								</Button>
							</div>
						</div>
					</form>

					<Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 text-white-400 hover:opacity-100 focus:outline-none">
						<X className="h-4 w-4" />
						<span className="sr-only">Close</span>
					</Dialog.Close>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
