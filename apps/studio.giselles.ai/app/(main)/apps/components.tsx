"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AgentId } from "@/services/agents";
import { Toast } from "@giselles-ai/components/toast";
import { useToast } from "@giselles-ai/contexts/toast";
import { CopyIcon, LoaderCircleIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { useRef, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { copyAgent, deleteAgent } from "./actions";
import { formatTimestamp } from "@giselles-ai/lib/utils";
import { gsap } from "gsap";
import { useEffect } from "react";

export function CreateAgentButton() {
	const { pending } = useFormStatus();
	return (
		<Button type="submit" disabled={pending} data-loading={pending}>
			New App +
		</Button>
	);
}

const colors = [
	{ border: "#3B82F6", gradient: "linear-gradient(145deg, #3B82F6, #0d1117)" },
	{ border: "#10B981", gradient: "linear-gradient(180deg, #10B981, #0d1117)" },
	{ border: "#F59E0B", gradient: "linear-gradient(165deg, #F59E0B, #0d1117)" },
	{ border: "#EF4444", gradient: "linear-gradient(195deg, #EF4444, #0d1117)" },
	{ border: "#8B5CF6", gradient: "linear-gradient(225deg, #8B5CF6, #0d1117)" },
	{ border: "#06B6D4", gradient: "linear-gradient(135deg, #06B6D4, #0d1117)" },
];

const stringToHash = (str: string) => {
	let hash = 0;
	if (str.length === 0) return hash;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash |= 0; // Convert to 32bit integer
	}
	return Math.abs(hash);
};

const getDeterministicColor = (id: string) => {
	const hash = stringToHash(id);
	return colors[hash % colors.length];
};

type AgentCardProps = {
	agent: {
		id: AgentId;
		name: string | null;
		updatedAt: Date;
		workspaceId: string | null;
	};
};

export function AgentCard({ agent }: AgentCardProps) {
	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		const card = e.currentTarget;
		const rect = card.getBoundingClientRect();
		card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
		card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
	};

	if (!agent.workspaceId) {
		return null;
	}

	const color = getDeterministicColor(agent.id);

	return (
		<div
			onMouseMove={handleMouseMove}
			className="group relative flex h-auto w-full flex-grow basis-[280px] flex-col overflow-hidden rounded-[12px] border-2"
			style={
				{
					"--spotlight-color": "rgba(255,255,255,0.3)",
					background: color.gradient,
					borderColor: color.border,
				} as React.CSSProperties
			}
		>
			<div
				className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
				style={{
					background:
						"radial-gradient(circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 70%)",
				}}
			/>

			<div className="relative z-10 flex h-full w-full cursor-default flex-col p-4">
				<div className="flex w-full justify-end gap-x-2">
					<DuplicateAgentButton
						agentId={agent.id}
						agentName={agent.name || "Untitled"}
					/>
					<DeleteAgentButton
						agentId={agent.id}
						agentName={agent.name || "Untitled"}
					/>
				</div>
				<Link
					href={`/workspaces/${agent.workspaceId}`}
					className="block w-full flex-grow cursor-pointer pt-2"
				>
					<div className="flex h-full flex-col">
						<div className="aspect-video w-full rounded-lg bg-white/5" />
						<div className="mt-2">
							<h3 className="font-sans text-[18px] font-semibold text-white-400 line-clamp-2">
								{agent.name || "Untitled"}
							</h3>
							<div className="flex items-center justify-between">
								<span className="max-w-[200px] truncate font-geist text-xs text-white/80">
									Edited{" "}
									{formatTimestamp.toRelativeTime(
										new Date(agent.updatedAt).getTime(),
									)}
								</span>
							</div>
						</div>
					</div>
				</Link>
			</div>
		</div>
	);
}

type AgentGridProps = {
	agents: {
		id: AgentId;
		name: string | null;
		updatedAt: Date;
		workspaceId: string | null;
	}[];
};

export const AgentGrid = ({ agents }: AgentGridProps) => {
	const rootRef = useRef<HTMLDivElement>(null);
	const fadeRef = useRef<HTMLDivElement>(null);
	const pos = useRef({ x: 0, y: 0 });
	const setX = useRef<any>(null);
	const setY = useRef<any>(null);

	useEffect(() => {
		const el = rootRef.current;
		if (!el) return;
		setX.current = gsap.quickSetter(el, "--x", "px");
		setY.current = gsap.quickSetter(el, "--y", "px");
		const { width, height } = el.getBoundingClientRect();
		pos.current = { x: width / 2, y: height / 2 };
		if (setX.current && setY.current) {
			setX.current(pos.current.x);
			setY.current(pos.current.y);
		}
	}, []);

	const moveTo = (x: number, y: number) => {
		gsap.to(pos.current, {
			x,
			y,
			duration: 0.45,
			ease: "power3.out",
			onUpdate: () => {
				if (setX.current && setY.current) {
					setX.current(pos.current.x);
					setY.current(pos.current.y);
				}
			},
			overwrite: true,
		});
	};

	const handleMove = (e: React.PointerEvent) => {
		if (!rootRef.current) return;
		const r = rootRef.current.getBoundingClientRect();
		moveTo(e.clientX - r.left, e.clientY - r.top);
		gsap.to(fadeRef.current, { opacity: 0, duration: 0.25, overwrite: true });
	};

	const handleLeave = () => {
		gsap.to(fadeRef.current, {
			opacity: 1,
			duration: 0.6,
			overwrite: true,
		});
	};

	return (
		<div
			ref={rootRef}
			onPointerMove={handleMove}
			onPointerLeave={handleLeave}
			className="relative flex h-full w-full flex-wrap items-start justify-center gap-4"
			style={
				{
					"--r": "400px",
					"--x": "50%",
					"--y": "50%",
				} as React.CSSProperties
			}
		>
			{agents.map((agent) => (
				<AgentCard key={agent.id} agent={agent} />
			))}
			<div
				className="pointer-events-none absolute inset-0 z-30"
				style={{
					backdropFilter: "grayscale(1) brightness(0.78)",
					WebkitBackdropFilter: "grayscale(1) brightness(0.78)",
					background: "rgba(0,0,0,0.001)",
					maskImage:
						"radial-gradient(circle var(--r) at var(--x) var(--y),transparent 0%,transparent 15%,rgba(0,0,0,0.10) 30%,rgba(0,0,0,0.22)45%,rgba(0,0,0,0.35)60%,rgba(0,0,0,0.50)75%,rgba(0,0,0,0.68)88%,white 100%)",
					WebkitMaskImage:
						"radial-gradient(circle var(--r) at var(--x) var(--y),transparent 0%,transparent 15%,rgba(0,0,0,0.10) 30%,rgba(0,0,0,0.22)45%,rgba(0,0,0,0.35)60%,rgba(0,0,0,0.50)75%,rgba(0,0,0,0.68)88%,white 100%)",
				}}
			/>
			<div
				ref={fadeRef}
				className="pointer-events-none absolute inset-0 z-40 transition-opacity duration-[250ms]"
				style={{
					backdropFilter: "grayscale(1) brightness(0.78)",
					WebkitBackdropFilter: "grayscale(1) brightness(0.78)",
					background: "rgba(0,0,0,0.001)",
					maskImage:
						"radial-gradient(circle var(--r) at var(--x) var(--y),white 0%,white 15%,rgba(255,255,255,0.90)30%,rgba(255,255,255,0.78)45%,rgba(255,255,255,0.65)60%,rgba(255,255,255,0.50)75%,rgba(255,255,255,0.32)88%,transparent 100%)",
					WebkitMaskImage:
						"radial-gradient(circle var(--r) at var(--x) var(--y),white 0%,white 15%,rgba(255,255,255,0.90)30%,rgba(255,255,255,0.78)45%,rgba(255,255,255,0.65)60%,rgba(255,255,255,0.50)75%,rgba(255,255,255,0.32)88%,transparent 100%)",
					opacity: 1,
				}}
			/>
		</div>
	);
};

export function Toasts() {
	const { toasts } = useToast();
	return (
		<>
			{toasts.map(({ id, ...props }) => (
				<Toast key={id} {...props} />
			))}
		</>
	);
}

export function DuplicateAgentButton({
	agentId,
	agentName,
}: { agentId: AgentId; agentName: string | null }) {
	const action = copyAgent.bind(null, agentId);
	const { addToast } = useToast();
	const [isPending, startTransition] = useTransition();
	const formRef = useRef<HTMLFormElement>(null);

	const handleConfirm = () => {
		formRef.current?.requestSubmit();
	};

	const formAction = (formData: FormData) => {
		startTransition(async () => {
			const res = await action(formData);
			switch (res.result) {
				case "success":
					return redirect(`/workspaces/${res.workspaceId}`);

				case "error":
					addToast({ message: res.message, type: "error" });
			}
		});
	};

	return (
		<form ref={formRef} action={formAction}>
			<AlertDialog>
				<TooltipProvider delayDuration={0}>
					<Tooltip>
						<AlertDialogTrigger asChild>
							<TooltipTrigger asChild>
								<button
									type="button"
									className="text-black-30 hover:text-black--30"
									disabled={isPending}
								>
									{isPending ? (
										<LoaderCircleIcon className="w-[16px] h-[16px] animate-spin" />
									) : (
										<CopyIcon className="w-[16px] h-[16px]" />
									)}
								</button>
							</TooltipTrigger>
						</AlertDialogTrigger>
						<TooltipContent side="top">
							<p>Duplicate</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
				<AlertDialogContent className="text-white-800">
					<AlertDialogHeader>
						<AlertDialogTitle className="font-sans text-[20px] font-medium">
							Are you sure to duplicate this App?
						</AlertDialogTitle>
						{agentName && (
							<AlertDialogDescription className="text-white-800 font-sans">
								{agentName}
							</AlertDialogDescription>
						)}
					</AlertDialogHeader>
					<AlertDialogFooter className="mt-6">
						<AlertDialogCancel className="border border-black-400 bg-transparent hover:bg-white-800 hover:text-black-900 text-white-800 rounded-lg py-2 px-6 font-sans text-[16px] transition-colors">
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleConfirm}
							className="bg-primary-900 hover:bg-transparent hover:text-primary-900 hover:border-primary-900 border border-transparent text-white-800 rounded-lg py-2 px-6 font-sans text-[16px] transition-colors"
						>
							Duplicate
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</form>
	);
}

export function DeleteAgentButton({
	agentId,
	agentName,
}: {
	agentId: AgentId;
	agentName: string | null;
}) {
	const action = deleteAgent.bind(null, agentId);
	const { addToast } = useToast();
	const [isPending, startTransition] = useTransition();
	const formRef = useRef<HTMLFormElement>(null);
	const router = useRouter();
	const handleConfirm = () => {
		formRef.current?.requestSubmit();
	};

	const formAction = (formData: FormData) => {
		startTransition(async () => {
			const res = await action(formData);
			switch (res.result) {
				case "success":
					router.refresh();
					break;
				case "error":
					addToast({ message: res.message, type: "error" });
					break;
			}
		});
	};

	return (
		<form ref={formRef} action={formAction}>
			<AlertDialog>
				<TooltipProvider delayDuration={0}>
					<Tooltip>
						<AlertDialogTrigger asChild>
							<TooltipTrigger asChild>
								<button
									type="button"
									className="text-black-30 hover:text-red-500"
									disabled={isPending}
								>
									{isPending ? (
										<LoaderCircleIcon className="w-[16px] h-[16px] animate-spin" />
									) : (
										<TrashIcon className="w-[16px] h-[16px]" />
									)}
								</button>
							</TooltipTrigger>
						</AlertDialogTrigger>
						<TooltipContent side="top">
							<p>Delete</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
				<AlertDialogContent className="text-white-800">
					<AlertDialogHeader>
						<AlertDialogTitle className="font-sans text-[20px] font-medium">
							Are you sure you want to delete this App?
						</AlertDialogTitle>
						{agentName && (
							<AlertDialogDescription className="text-white-800 font-sans">
								This action cannot be undone. This will permanently delete the
								app "{agentName}".
							</AlertDialogDescription>
						)}
					</AlertDialogHeader>
					<AlertDialogFooter className="mt-6">
						<AlertDialogCancel className="border border-black-400 bg-transparent hover:bg-white-800 hover:text-black-900 text-white-800 rounded-lg py-2 px-6 font-sans text-[16px] transition-colors">
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleConfirm}
							className="bg-error-900 hover:bg-transparent hover:text-error-900 hover:border-error-900 border border-transparent text-white-800 rounded-lg py-2 px-6 font-sans text-[16px] transition-colors"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</form>
	);
}
