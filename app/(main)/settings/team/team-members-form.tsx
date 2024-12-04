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
import { Card } from "../components/card";
import { addTeamMember } from "./actions";

export function TeamMembersForm() {
	const [email, setEmail] = useState("");
	const [role, setRole] = useState("member");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

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
		<Card
			title="Add New Member"
			description="Invite a new team member by entering their email address"
		>
			<form onSubmit={handleSubmit} className="flex gap-3">
				<Input
					type="email"
					placeholder="member@example.com"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className="flex-1"
					disabled={isLoading}
				/>
				<Select value={role} onValueChange={setRole} disabled={isLoading}>
					<SelectTrigger className="w-[140px]">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="admin">Admin</SelectItem>
						<SelectItem value="member">Member</SelectItem>
					</SelectContent>
				</Select>
				<Button type="submit" disabled={isLoading} className="w-fit">
					Add Member
				</Button>
			</form>
		</Card>
	);
}
