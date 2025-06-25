"use client";

import { useCallback, useState } from "react";
import { ReadOnlyBanner } from "../../ui/read-only-banner";
import { V2Container, V2Footer, V2Header } from "./components";
import { RootProvider } from "./components/provider";
import type { LeftPanelValue, V2LayoutState } from "./state";

export function V2Placeholder({
	isReadOnly = false,
	userRole = "viewer",
}: {
	isReadOnly?: boolean;
	userRole?: "viewer" | "guest" | "editor" | "owner";
}) {
	const [showReadOnlyBanner, setShowReadOnlyBanner] = useState(isReadOnly);
	const [layoutState, setLayoutState] = useState<V2LayoutState>({
		leftPanel: null,
	});

	const handleDismissBanner = useCallback(() => {
		setShowReadOnlyBanner(false);
	}, []);

	const handleLeftPanelValueChange = useCallback(
		(newLeftPanelValue: LeftPanelValue) => {
			setLayoutState((prev) => ({
				...prev,
				leftPanel:
					prev.leftPanel === newLeftPanelValue ? null : newLeftPanelValue,
			}));
		},
		[],
	);

	return (
		<div className="flex-1 overflow-hidden font-sans pl-[16px] flex flex-col">
			{showReadOnlyBanner && isReadOnly && (
				<ReadOnlyBanner
					onDismiss={handleDismissBanner}
					userRole={userRole}
					className="z-50"
				/>
			)}

			<RootProvider>
				<V2Header />
				<V2Container {...layoutState} />
				<V2Footer onLeftPaelValueChange={handleLeftPanelValueChange} />
			</RootProvider>
		</div>
	);
}
