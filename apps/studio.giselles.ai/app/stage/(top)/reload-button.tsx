"use client";

import { Button } from "@giselle-internal/ui/button";
import { RefreshCw } from "lucide-react";
import { useTransition } from "react";

export function ReloadButton({
	reloadAction,
}: {
	reloadAction: () => Promise<void>;
}) {
	const [isPending, startTransition] = useTransition();

	return (
		<form
			action={() => {
				startTransition(async () => {
					try {
						await reloadAction();
					} catch (error) {
						console.error("Reload failed:", error);
					}
				});
			}}
		>
			<Button
				type="submit"
				variant="subtle"
				aria-busy={isPending}
				leftIcon={
					<RefreshCw
						className={isPending ? "w-4 h-4 animate-spin" : "w-4 h-4"}
					/>
				}
				disabled={isPending}
			>
				Reload
			</Button>
		</form>
	);
}
