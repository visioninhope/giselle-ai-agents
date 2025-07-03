"use client";

import { Button } from "@/components/ui/button";
import { Play, RefreshCw } from "lucide-react";
import { useState } from "react";

export function ManualTriggerButton() {
	const [isLoading, setIsLoading] = useState(false);
	const [result, setResult] = useState<string>("");

	const handleManualTrigger = async () => {
		setIsLoading(true);
		setResult("");

		try {
			const response = await fetch("/api/vector-stores/github/ingest/test");
			const data = await response.text();

			if (response.ok) {
				try {
					const jsonData = JSON.parse(data);
					setResult(
						`Success: Processed ${jsonData.total} repositories (${jsonData.successful} successful, ${jsonData.failed} failed)`,
					);
				} catch {
					setResult("Processing started successfully");
				}
			} else {
				setResult(`Error: ${data}`);
			}
		} catch (error) {
			console.error("Manual trigger error:", error);
			setResult(
				`Error: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col gap-2">
			<Button
				onClick={handleManualTrigger}
				disabled={isLoading}
				variant="outline"
				size="sm"
				className="flex items-center gap-2"
			>
				{isLoading ? (
					<RefreshCw className="h-4 w-4 animate-spin" />
				) : (
					<Play className="h-4 w-4" />
				)}
				{isLoading ? "Processing..." : "Manual Trigger"}
			</Button>
			{result && (
				<div
					className={`text-xs p-2 rounded ${
						result.startsWith("Error")
							? "bg-red-900/20 text-red-400"
							: "bg-green-900/20 text-green-400"
					}`}
				>
					{result}
				</div>
			)}
		</div>
	);
}
