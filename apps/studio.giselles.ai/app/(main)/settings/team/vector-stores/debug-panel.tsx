"use client";

import { useEffect, useState } from "react";

type DebugState =
	| "unauthorized"
	| "error"
	| "no-installation"
	| "connected"
	| "multiple-repos";

type DebugPanelProps = {
	currentState: DebugState;
	repositoryCount?: number;
};

export function DebugPanel({
	currentState,
	repositoryCount = 0,
}: DebugPanelProps) {
	const [debugState, setDebugState] = useState<DebugState>(currentState);
	const [isVisible, setIsVisible] = useState(false);

	const isDebugMode = process.env.NODE_ENV === "development";

	useEffect(() => {
		setDebugState(currentState);
	}, [currentState]);

	if (!isDebugMode) {
		return null;
	}

	const handleStateChange = (newState: DebugState) => {
		setDebugState(newState);
		// Reload the page with a query parameter to simulate the state
		const url = new URL(window.location.href);
		if (newState === currentState) {
			url.searchParams.delete("debug");
		} else {
			url.searchParams.set("debug", newState);
		}
		window.location.href = url.toString();
	};

	return (
		<div className="mb-6">
			<button
				type="button"
				onClick={() => setIsVisible(!isVisible)}
				className="mb-4 px-3 py-1 bg-yellow-600 text-yellow-100 rounded text-sm font-medium"
			>
				🔧 Debug Panel (Dev Only) {isVisible ? "▼" : "▶"}
			</button>

			{isVisible && (
				<div className="p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
					<div className="mb-3">
						<h3 className="text-yellow-400 font-medium mb-1">
							Vector Stores Debug Panel
						</h3>
						<p className="text-yellow-300/80 text-sm">
							Current: {currentState}{" "}
							{repositoryCount > 0 && `(${repositoryCount} repos)`}
						</p>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
						<button
							type="button"
							onClick={() => handleStateChange("unauthorized")}
							className={`px-3 py-2 rounded text-sm transition-colors ${
								debugState === "unauthorized"
									? "bg-red-600 text-white"
									: "bg-gray-600 text-gray-300 hover:bg-gray-500"
							}`}
						>
							🔒 GitHub Auth Required
						</button>

						<button
							type="button"
							onClick={() => handleStateChange("error")}
							className={`px-3 py-2 rounded text-sm transition-colors ${
								debugState === "error"
									? "bg-red-600 text-white"
									: "bg-gray-600 text-gray-300 hover:bg-gray-500"
							}`}
						>
							❌ GitHub Error
						</button>

						<button
							type="button"
							onClick={() => handleStateChange("no-installation")}
							className={`px-3 py-2 rounded text-sm transition-colors ${
								debugState === "no-installation"
									? "bg-orange-600 text-white"
									: "bg-gray-600 text-gray-300 hover:bg-gray-500"
							}`}
						>
							📱 No GitHub App
						</button>

						<button
							type="button"
							onClick={() => handleStateChange("connected")}
							className={`px-3 py-2 rounded text-sm transition-colors ${
								debugState === "connected"
									? "bg-green-600 text-white"
									: "bg-gray-600 text-gray-300 hover:bg-gray-500"
							}`}
						>
							✅ Connected (Empty)
						</button>

						<button
							type="button"
							onClick={() => handleStateChange("multiple-repos")}
							className={`px-3 py-2 rounded text-sm transition-colors ${
								debugState === "multiple-repos"
									? "bg-blue-600 text-white"
									: "bg-gray-600 text-gray-300 hover:bg-gray-500"
							}`}
						>
							📚 Multiple Repos
						</button>

						<button
							type="button"
							onClick={() => {
								const url = new URL(window.location.href);
								url.searchParams.delete("debug");
								window.location.href = url.toString();
							}}
							className="px-3 py-2 rounded text-sm bg-purple-600 text-white hover:bg-purple-500 transition-colors"
						>
							🔄 Reset to Real State
						</button>
					</div>

					<div className="mt-3 text-xs text-yellow-300/60">
						💡 Click a state to simulate it. This panel only appears in
						development.
					</div>
				</div>
			)}
		</div>
	);
}
