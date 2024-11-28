"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { addTeamMember } from "./actions";

export function TeamMembersForm() {
	const [email, setEmail] = useState("");
	const [role, setRole] = useState("member");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async () => {
		if (!email) return;

		setIsLoading(true);
		try {
			const formData = new FormData();
			formData.append("email", email);
			formData.append("role", role);

			const result = await addTeamMember(formData);
			if (result.success) {
				setEmail("");
				setRole("member");
			}
		} catch (error) {
			console.error("Error adding member:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="rounded-md border border-zinc-800 p-4 space-y-4 bg-zinc-900/50 mb-4">
			<h3 className="font-medium text-zinc-200">Add New Member</h3>
			<div className="grid grid-cols-12 gap-4">
				<Input
					placeholder="Email address"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className="col-span-8 bg-zinc-900 border-zinc-800 text-zinc-200 placeholder:text-zinc-500"
					disabled={isLoading}
				/>
				<div className="col-span-2">
					<Select value={role} onValueChange={setRole} disabled={isLoading}>
						<SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-200">
							<SelectValue placeholder="Role" />
						</SelectTrigger>
						<SelectContent className="bg-zinc-900 border-zinc-800">
							<SelectItem value="admin">Admin</SelectItem>
							<SelectItem value="member">Member</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<Button
					className="col-span-2"
					onClick={handleSubmit}
					disabled={isLoading}
				>
					Add Member
				</Button>
			</div>
		</div>
	);
}
