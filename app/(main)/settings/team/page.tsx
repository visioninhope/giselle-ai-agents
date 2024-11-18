"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/base-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Check, ChevronRight, Pencil, X } from "lucide-react";
import React from "react";

const TeamSettings = () => {
	const [teamName, setTeamName] = React.useState("Giselle Team");
	const [isEditingName, setIsEditingName] = React.useState(false);
	const [tempTeamName, setTempTeamName] = React.useState(teamName);
	const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

	// Usage data
	const proPlanLimit = 120;
	const usageMinutes = 150;
	const percentageUsed = Math.min((usageMinutes / proPlanLimit) * 100, 100);
	const percentageOverage = Math.max(
		0,
		((usageMinutes - proPlanLimit) / proPlanLimit) * 100,
	);

	const members = [
		{
			id: 1,
			name: "Satoshi Ebisawa",
			email: "satoshi.ebisawa@route06.co.jp",
			role: "admin",
		},
		{ id: 2, name: "John Doe", email: "john@route06.co.jp", role: "admin" },
		{ id: 3, name: "Jane Smith", email: "jane@route06.co.jp", role: "member" },
	];

	const agentLogs = [
		{
			id: "exec_123",
			agentId: "agent_1",
			agentName: "Data Analysis Agent",
			startTime: "2024-03-18 10:00:00",
			endTime: "2024-03-18 10:05:00",
			status: "succeeded",
			errorMessage: "",
			usedCharge: 5,
		},
		{
			id: "exec_124",
			agentId: "agent_2",
			agentName: "Code Review Agent",
			startTime: "2024-03-18 11:00:00",
			endTime: null,
			status: "in progress",
			errorMessage: "",
			usedCharge: 3,
		},
	];

	const handleSaveTeamName = () => {
		setTeamName(tempTeamName);
		setIsEditingName(false);
	};

	const handleCancelTeamName = () => {
		setTempTeamName(teamName);
		setIsEditingName(false);
	};

	const UsageDisplay = () => (
		<Card className="bg-zinc-950 border-zinc-800">
			<CardHeader>
				<CardTitle className="text-zinc-200">Agent Time Usage</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="space-y-4">
					<div className="relative h-4 w-full bg-zinc-800 overflow-hidden rounded-full">
						<div
							className="absolute top-0 left-0 h-full bg-blue-500"
							style={{ width: `${percentageUsed}%` }}
						/>
						{percentageOverage > 0 && (
							<div
								className="absolute top-0 right-0 h-full bg-rose-500"
								style={{ width: `${percentageOverage}%` }}
							/>
						)}
					</div>
					<div className="flex justify-between text-sm text-zinc-400">
						<span>0 min</span>
						<span className="font-semibold text-zinc-300">
							{proPlanLimit} min
						</span>
						<span>{usageMinutes} min</span>
					</div>
					<div className="space-y-2">
						<p className="text-sm text-zinc-200">
							<span className="font-semibold">{usageMinutes} minutes</span> used
						</p>
						<p className="text-sm text-zinc-400">
							{proPlanLimit} minutes included with Pro plan
						</p>
						{usageMinutes > proPlanLimit && (
							<Alert className="mt-4 bg-rose-500/10 border-rose-500/20">
								<AlertDescription className="text-rose-200">
									{usageMinutes - proPlanLimit} minutes over Pro plan limit.
									Additional minutes will be billed at the standard rate.
								</AlertDescription>
							</Alert>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);

	return (
		<div className="space-y-6 p-6 bg-black min-h-screen">
			{/* Usage Display */}
			<UsageDisplay />

			{/* Team Name Section */}
			<Card className="bg-zinc-950 border-zinc-800">
				<CardHeader>
					<CardTitle className="text-zinc-200">Team Name</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center space-x-4">
						{isEditingName ? (
							<>
								<Input
									value={tempTeamName}
									onChange={(e) => setTempTeamName(e.target.value)}
									className="max-w-md bg-zinc-900 border-zinc-800 text-zinc-200"
								/>
								<Button
									size="icon"
									className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
									onClick={handleSaveTeamName}
								>
									<Check className="h-4 w-4" />
								</Button>
								<Button
									size="icon"
									variant="ghost"
									className="text-zinc-400 hover:text-zinc-300"
									onClick={handleCancelTeamName}
								>
									<X className="h-4 w-4" />
								</Button>
							</>
						) : (
							<>
								<span className="text-lg text-zinc-200">{teamName}</span>
								<Button
									size="icon"
									variant="ghost"
									className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
									onClick={() => setIsEditingName(true)}
								>
									<Pencil className="h-4 w-4" />
								</Button>
							</>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Team Members Section */}
			<Card className="bg-zinc-950 border-zinc-800">
				<CardHeader>
					<CardTitle className="text-zinc-200">Team Members</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Add Member Form */}
					<div className="rounded-md border border-zinc-800 p-4 space-y-4 bg-zinc-900/50">
						<h3 className="font-medium text-zinc-200">Add New Member</h3>
						<div className="grid grid-cols-12 gap-4">
							<Input
								placeholder="Email address"
								className="col-span-8 bg-zinc-900 border-zinc-800 text-zinc-200 placeholder:text-zinc-500"
							/>
							<div className="col-span-2">
								<Select defaultValue="member">
									<SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-200">
										<SelectValue placeholder="Role" />
									</SelectTrigger>
									<SelectContent className="bg-zinc-900 border-zinc-800">
										<SelectItem value="admin">Admin</SelectItem>
										<SelectItem value="member">Member</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<Button className="col-span-2">Add Member</Button>
						</div>
					</div>

					{/* Members List */}
					<div className="rounded-md border border-zinc-800">
						<div className="grid grid-cols-4 gap-4 border-b border-zinc-800 bg-zinc-900/50 p-4 font-medium text-zinc-200">
							<div>Name</div>
							<div>Email</div>
							<div>Role</div>
							<div>Actions</div>
						</div>
						<div className="divide-y divide-zinc-800">
							{members.map((member) => (
								<div
									key={member.id}
									className="grid grid-cols-4 gap-4 p-4 items-center text-zinc-200"
								>
									<div>{member.name}</div>
									<div className="text-zinc-400">{member.email}</div>
									<div>
										<Select defaultValue={member.role}>
											<SelectTrigger className="w-32 bg-zinc-900 border-zinc-800">
												<SelectValue />
											</SelectTrigger>
											<SelectContent className="bg-zinc-900 border-zinc-800">
												<SelectItem value="admin">Admin</SelectItem>
												<SelectItem value="member">Member</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div>
										<Button variant="destructive" size="sm">
											Remove
										</Button>
									</div>
								</div>
							))}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Agent Usage Logs */}
			<Card className="bg-zinc-950 border-zinc-800">
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle className="text-zinc-200">Recent Agent Usage</CardTitle>
					<a
						href="/settings/team/agent-logs"
						className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
					>
						View all logs
						<ChevronRight className="h-4 w-4 ml-1" />
					</a>
				</CardHeader>
				<CardContent>
					<div className="rounded-md border border-zinc-800">
						<div className="grid grid-cols-6 gap-4 border-b border-zinc-800 bg-zinc-900/50 p-4 font-medium text-zinc-200">
							<div>Execution ID</div>
							<div>Agent</div>
							<div>Start Time</div>
							<div>End Time</div>
							<div>Status</div>
							<div>Charge</div>
						</div>
						<div className="divide-y divide-zinc-800">
							{agentLogs.slice(0, 5).map((log) => (
								<div
									key={log.id}
									className="grid grid-cols-6 gap-4 p-4 items-center text-zinc-200"
								>
									<div className="font-mono text-sm">{log.id}</div>
									<div>{log.agentName}</div>
									<div className="text-zinc-400">{log.startTime}</div>
									<div className="text-zinc-400">{log.endTime || "-"}</div>
									<div>
										<Badge
											variant={
												log.status === "succeeded"
													? "default"
													: log.status === "failed"
														? "destructive"
														: "secondary"
											}
											className={
												log.status === "succeeded"
													? "bg-emerald-500/10 text-emerald-200"
													: log.status === "failed"
														? "bg-rose-500/10 text-rose-200"
														: "bg-zinc-500/10 text-zinc-200"
											}
										>
											{log.status}
										</Badge>
									</div>
									<div>{log.usedCharge} minutes</div>
								</div>
							))}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Billing Section */}
			<Card className="bg-zinc-950 border-zinc-800">
				<CardHeader>
					<CardTitle className="text-zinc-200">Billing</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-zinc-400">Current Plan</p>
							<p className="text-xl font-semibold text-zinc-200">Pro Plan</p>
						</div>
						<Button>Manage Billing</Button>
					</div>
				</CardContent>
			</Card>

			{/* Danger Zone */}
			<Card className="bg-zinc-950 border-zinc-800">
				<CardHeader>
					<CardTitle className="text-rose-500">Danger Zone</CardTitle>
				</CardHeader>
				<CardContent>
					<Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
						<DialogTrigger asChild>
							<Button variant="destructive">Delete Team</Button>
						</DialogTrigger>
						<DialogContent className="bg-zinc-950 border-zinc-800">
							<DialogHeader>
								<DialogTitle className="text-zinc-200">Delete Team</DialogTitle>
							</DialogHeader>
							<Alert
								variant="destructive"
								className="bg-rose-500/10 border-rose-500/20"
							>
								<AlertDescription>
									This action cannot be undone. This will permanently delete the
									team and remove all members.
								</AlertDescription>
							</Alert>
							<div className="flex justify-end space-x-2">
								<Button
									variant="outline"
									onClick={() => setShowDeleteConfirm(false)}
									className="bg-transparent border-zinc-800 text-zinc-200 hover:bg-zinc-900"
								>
									Cancel
								</Button>
								<Button variant="destructive">Delete Team</Button>
							</div>
						</DialogContent>
					</Dialog>
				</CardContent>
			</Card>
		</div>
	);
};

export default TeamSettings;
