"use client";

import { Button } from "@/components/ui/button";
import type { AgentId } from "@/services/agents";
import { Toast } from "@giselles-ai/components/toast";
import { useToast } from "@giselles-ai/contexts/toast";
import { CopyIcon, LoaderIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { useTransition } from "react";
import { useFormStatus } from "react-dom";
import { copyAgent } from "./actions";

export function CreateAgentButton() {
	const { pending } = useFormStatus();
	return (
		<Button type="submit" disabled={pending} data-loading={pending}>
			New Agent +
		</Button>
	);
}

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

export function DuplicateAgentButton({ agentId }: { agentId: AgentId }) {
	const action = copyAgent.bind(null, agentId);
	const { addToast } = useToast();
	const [isPending, startTransition] = useTransition();

	const formAction = async (formData: FormData) => {
		startTransition(async () => {
			const res = await action(formData);
			switch (res.result) {
				case "success":
					return redirect(`/p/${res.agentId}`);

				case "error":
					addToast({ message: res.message, type: "error" });
			}
		});
	};

	return (
		<form action={formAction} className="absolute top-4 right-4">
			<button
				type="submit"
				className="text-black-30 hover:text-black--30"
				disabled={isPending}
			>
				{isPending ? (
					<LoaderIcon className="w-[16px] h-[16px] animate-spin" />
				) : (
					<CopyIcon className="w-[16px] h-[16px]" />
				)}
			</button>
		</form>
	);
}
